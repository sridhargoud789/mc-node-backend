const fs = require('fs')
const { Readable } = require('stream')
const pinataSDK = require('@pinata/sdk')
const nodeHtmlToImage = require('node-html-to-image')
const config = require('../config/config.js')
const pinata = new pinataSDK(config.PINATA_API_Key, config.PINATA_API_Secret)

const pinataHelper = async (nftData) => {
	try {
		const htmlPath = global.project_dir + '/certificate/certificate.html'

		const today = new Date()
		const yyyy = today.getFullYear()
		let mm = today.getMonth() + 1 // Months start at 0
		let dd = today.getDate()

		if (dd < 10) dd = '0' + dd
		if (mm < 10) mm = '0' + mm

		const formattedToday = dd + '/' + mm + '/' + yyyy

		let html = fs.readFileSync(htmlPath, 'utf-8')

		// @todo update dynamically
		html = html.replace('$courseName', nftData.courseName)
		html = html.replace('$userName', nftData.username)
		html = html.replace('$completionTime', formattedToday)
		html = html.replace('$duration', nftData.duration)

		const updatedHtml = html

		const image = await nodeHtmlToImage({
			html: updatedHtml,
		})

		// history_user_exams

		await pinata.testAuthentication()
		const imageResult = await pinata.pinFileToIPFS(Readable.from(image), {
			// @todo update image name
			pinataMetadata: {
				name: `${nftData.courseName}_${nftData.username}`,
			},
			pinataOptions: {
				cidVersion: 0,
			},
		})
		const metadata = {
			// @todo update image name
			name: nftData.courseName,
			// @todo update image description
			description:
			nftData.courseDescription,
			image: `https://mundocrypto.mypinata.cloud/ipfs/${imageResult.IpfsHash}`,
		}
		const jsonResult = await pinata.pinJSONToIPFS(metadata, {
			// @todo update image name
			pinataMetadata: {
				name: `${nftData.courseName}_${nftData.username} Metadata`,
			},
			pinataOptions: {
				cidVersion: 0,
			},
		})
		return jsonResult;
	} catch (error) {
		console.log(error)
		return false;
	}
}

module.exports = {
	pinataHelper,
}