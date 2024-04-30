const aws = require('aws-sdk')
const { S3Client } = require('@aws-sdk/client-s3')
const { Upload } = require('@aws-sdk/lib-storage')

const config = require('../config/config')
const fs = require('fs')
const AWSS3Bucket = config.MS_TUTORIAL_BUCKET
const s3 = new aws.S3({
	accessKeyId: config.AWS_ACCESS_KEY,
	secretAccessKey: config.AWS_SECRET_KEY,
})

const ss3 = new S3Client({
	region: config.AWS_REGION,
	credentials: {
		accessKeyId: config.AWS_ACCESS_KEY,
		secretAccessKey: config.AWS_SECRET_KEY,
	},
})

const cf = require('aws-cloudfront-sign')

const signedUrlExpireSeconds = 60 * 5

const awsHelper = {
	fileUpload2: async (
		file,
		folderName,
		imageName,
		fileExtension,
		bucket = AWSS3Bucket,
		isPublic = false
	) => {
		return new Promise(async (resolve, reject) => {
			try {
				const params = {
					Bucket: bucket,
					Key: folderName + '/' + imageName, // File name you want to save as in S3
					Body: file,
					ContentType: fileExtension,
				}
				if (isPublic) {
					params.ACL = 'public-read'
				}

				try {
					// upload file to s3 parallelly in chunks
					// it supports min 5MB of file size
					const uploadParallel = new Upload({
						client: ss3,
						queueSize: 4, // optional concurrency configuration
						partSize: 5542880, // optional size of each part
						leavePartsOnError: false, // optional manually handle dropped parts
						params,
					})

					// checking progress of upload
					await uploadParallel.on(
						'httpUploadProgress',
						(progress) => {
							console.log(progress)
						}
					)

					// after completion of upload
					await uploadParallel.done().then((data) => {
						console.log('upload completed!', { data })
						resolve({ success: true, data })
					})
				} catch (error) {
					resolve({
						success: false,
						message: error.message,
					})
				}
			} catch (error) {
				console.log('error', error)
				resolve({ success: false })
			}
		})
	},

	fileUpload: async (
		file,
		folderName,
		imageName,
		fileExtension,
		bucket = AWSS3Bucket,
		isPublic = false
	) => {
		return new Promise(async (resolve, reject) => {
			try {
				const params = {
					Bucket: bucket,
					Key: folderName + '/' + imageName, // File name you want to save as in S3
					Body: file,
					ContentType: fileExtension,
				}
				if (isPublic) {
					params.ACL = 'public-read'
				}

				await s3.upload(params, (err, data) => {
					console.log('err', err)
					if (err) {
						resolve({ success: false })
					}
					resolve({ success: true, data })
				})
			} catch (error) {
				console.log('error', error)
				resolve({ success: false })
			}
		})
	},

	/* getFileUrl
	 * get file url from path
	 * @param {string} filePath from where function calls
	 * @return {string}  Return Response.
	 */
	getFileUrl: async (filePath, AWSS3Bucket) => {
		return new Promise(async (resolve, reject) => {
			try {
				const params = {
					Bucket: AWSS3Bucket,
					Key: filePath,
				}
				params.Expires = signedUrlExpireSeconds
				const url = s3.getSignedUrl('getObject', params)
				resolve(url)
			} catch (error) {
				reject(new Error(messages.apiResponses.somethingWentWrong))
			}
		})
	},
	/* getFileUrlSync
	 * get file url from path
	 * @param {string} filePath from where function calls
	 * @return {string}  Return Response.
	 */
	getFileUrlSync: (filePath, AWSS3Bucket) => {
		try {
			const params = {
				Bucket: AWSS3Bucket,
				Key: filePath,
			}
			params.Expires = signedUrlExpireSeconds
			return s3.getSignedUrl('getObject', params)
		} catch (error) {
			return error
		}
	},
	/* getAllFileFromDir
	 * get all files with path from selected directory
	 * @param {string} dirPath from where function calls
	 * @return {Object} json Return Response.
	 */
	getAllFileFromDir: async (dirPath) => {
		return new Promise(async (resolve, reject) => {
			try {
				const params = {
					Bucket: AWSS3Bucket,
					Delimiter: '/',
					Prefix: dirPath + '/',
				}
				const imgObject = []
				await s3.listObjectsV2(params, (err, data) => {
					if (err) {
						reject(err)
					}
					if (data) {
						for (
							let index = 1;
							index < data['Contents'].length;
							index++
						) {
							if (data['Contents'][index]['Size'] > 0) {
								imgObject[index] =
									data['Contents'][index]['Key']
							}
						}
					}
					resolve(imgObject)
				})
			} catch (error) {
				reject(new Error(messages.apiResponses.somethingWentWrong))
			}
		})
	},
	/* getFileUrl
	 * get file url from path
	 * @param {string} filePath from where function calls
	 * @return {string}  Return Response.
	 */
	deleteFileFromPath: (fileObject) => {
		try {
			const params = {
				Bucket: AWSS3Bucket,
				Delete: {
					Objects: fileObject,
					Quiet: false,
				},
			}
			s3.deleteObjects(params, function (err, metadata) {})
		} catch (error) {
			return false
		}
	},

	signedByCF: (expiryDate, key) => {
		const options = {
			keypairId: 'K249RPWABCU7GA',
			privateKeyPath: `${global.projectDir}/private_key_cf.pem`,
			// expireTime: expiryDate,
		}
		const signedUrl = cf.getSignedUrl(
			`https://d2l7u9mvx1mrwf.cloudfront.net/${key}`,
			options
		)
		return signedUrl
	},
}

module.exports = awsHelper
