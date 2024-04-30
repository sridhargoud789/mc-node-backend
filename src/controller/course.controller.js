const response = require('../helpers/response.helper')
const responseMessage = require('../config/messages/en')
const constants = require('../config/constants')
const courseService = require('../dbService/course.services')
const userService = require('../dbService/user.service')
const awsHelper = require('../helpers/aws.helper')
const config = require('../config/config')
const stripeHelper = require('../helpers/stripe.helper')
const logger = require('../config/logger')
const examService = require('../dbService/exam.services')
const { getVideoDurationInSeconds } = require('get-video-duration')
const fs = require('fs')
const csv = require('csv-parser')
const db = require('../../models')
const _ = require('lodash')

const createCourse = async (req, res, next) => {
	try {
		const {
			course_id,
			name,
			sub_title,
			features_list,
			learning_points,
			slug,
			description,
			duration,
			price,
			reword,
			category_id,
			language_id,
			is_free,
			is_public,
			is_published,
			is_partial_payment_available,
			is_ready_for_Learning,
			is_available_pay_mc_wallet,
			is_nft_free,
			Is_NFT_Available,
			is_sold_out,
			partialpay_stripe_price_obj,
			split_payment_amounts,
			custom_field_10,
			online_text,
			total_modules,
			training_type,
			access_type,
			launguage,
			ratings,
			telegram_link,
			whatsapp_link,
			telegram_users_google_link,
		} = req.body
		const { course_for } = req.body
		const courseFor = course_for.split(',')
		const courseForObj = {}
		courseFor.forEach((eachCoures) => {
			courseForObj[`${eachCoures}`] = 1
		})
		let url_image = null
		let url_image_mobile = null
		let url_image_thumbnail = null
		if (req.files?.url_image_thumbnail?.length) {
			const splitDataExt =
				req.files?.url_image_thumbnail[0].originalname.split('.')
			const ext = splitDataExt[splitDataExt.length - 1]
			const uploadImg = await awsHelper.fileUpload(
				req.files?.url_image_thumbnail[0].buffer,
				`${name}`,
				`url_image_thumbnail.${ext}`,
				req.files?.url_image_thumbnail[0].mimetype,
				config.MS_TUTORIAL_BUCKET
			)
			url_image_thumbnail = uploadImg.data.Key
		}

		if (req.files?.url_image_mobile?.length) {
			const splitDataExt =
				req.files?.url_image_mobile[0].originalname.split('.')
			const ext = splitDataExt[splitDataExt.length - 1]
			const uploadImg = await awsHelper.fileUpload(
				req.files?.url_image_mobile[0].buffer,
				`${name}`,
				`url_image_mobile.${ext}`,
				req.files?.url_image_mobile[0].mimetype,
				config.MS_TUTORIAL_BUCKET
			)
			url_image_mobile = uploadImg.data.Key
		}

		if (req.files?.url_image?.length) {
			const splitDataExt = req.files?.url_image[0].originalname.split('.')
			const ext = splitDataExt[splitDataExt.length - 1]
			const uploadImg = await awsHelper.fileUpload(
				req.files?.url_image[0].buffer,
				`${name}`,
				`url_image.${ext}`,
				req.files?.url_image[0].mimetype,
				config.MS_TUTORIAL_BUCKET
			)
			url_image = uploadImg.data.Key
		}

		const isCourseWithSameName = await courseService.courseDetails(
			name,
			'name'
		)
		const existingCourseData =
			course_id === 0
				? {}
				: await courseService.courseFullDetails(course_id)
		if (isCourseWithSameName && course_id === 0) {
			return response.helper(
				res,
				false,
				'COURSE_WITH_NAME_EXIST',
				{},
				200
			)
		}
		const courseData = {
			name,
			sub_title,
			features_list,
			learning_points,
			slug,
			duration,
			description,
			price,
			reword,
			url_image_thumbnail,
			url_image,
			url_image_mobile,
			language_id,
			is_public,
			is_published,
			is_partial_payment_available,
			is_ready_for_Learning,
			is_available_pay_mc_wallet,
			is_nft_free,
			Is_NFT_Available,
			is_sold_out,
			partialpay_stripe_price_obj,
			split_payment_amounts,
			custom_field_10,
			online_text,
			total_modules,
			training_type,
			access_type,
			launguage,
			ratings,
			telegram_link,
			whatsapp_link,
			telegram_users_google_link,
		}
		console.log(courseData)

		if (course_id === 0) {
			const stripeProductData = await stripeHelper.createProduct({
				name,
			})
			const productPriceData = await stripeHelper.createPrice({
				price,
				productId: stripeProductData.id,
			})
			courseData.stripe_product_id = stripeProductData.id
			courseData.stripe_price_id = productPriceData.id
		} else {
			courseData.stripe_product_id = existingCourseData.stripe_product_id
			courseData.stripe_price_id = existingCourseData.stripe_price_id

			if (url_image_thumbnail === null) {
				courseData.url_image_mobile =
					existingCourseData.url_image_mobile
				courseData.url_image = existingCourseData.url_image
				courseData.url_image_thumbnail =
					existingCourseData.url_image_thumbnail
			}
			if (price !== existingCourseData.price) {
				const productPriceData = await stripeHelper.createPrice({
					price,
					productId: existingCourseData.stripe_product_id,
				})
				courseData.stripe_price_id = productPriceData.id
			}
		}
		const priceobj = []
		if (!_.isEmpty(partialpay_stripe_price_obj)) {
			for (const p of JSON.parse(partialpay_stripe_price_obj)) {
				const productPriceData = await stripeHelper.createPrice({
					price: p.price_with_tax,
					productId: courseData.stripe_product_id,
				})
				priceobj.push({ ...p, stripeid: productPriceData.id })
			}
		}
		courseData.partialpay_stripe_price_obj =
			priceobj.length > 0 ? JSON.stringify(priceobj) : ''

		courseData.split_payment_amounts =
			priceobj.length > 0 ? JSON.stringify(priceobj) : ''

		console.log(courseData)

		if (course_id === 0) {
			const addCourseToDb = await courseService.addCourse(courseData)
			courseForObj.course_id = addCourseToDb.id
			await courseService.addCourserCategoryToDb(
				addCourseToDb.id,
				category_id,
				language_id
			)
			await courseService.addCourseForData(courseForObj)
			return response.helper(
				res,
				true,
				'_SUCCESS',
				{ courseData: addCourseToDb },
				200
			)
		} else {
			const resp = await courseService.updateCourse(course_id, courseData)
			return response.helper(
				resp,
				true,
				'_SUCCESS',
				{ courseData: resp },
				200
			)
		}
	} catch (err) {
		next(err)
	}
}

const createCoursePackages = async (req, res, next) => {
	try {
		const { name, description, price, banner, course_ids } = req.body
		const banner_url = ''
		// if(req.file?.banner) {
		// 	const splitDataExt = req.files.originalname.split('.')
		// 	const ext = splitDataExt[splitDataExt.length - 1]
		// 	uploadImg = await awsHelper.fileUpload(
		// 		req.files.banner.buffer,
		// 		`profile_pic`,
		// 		`${(new Date()).getTime()}.${ext}`,
		// 		req.file.mimetype,
		// 		config.MS_PUBLIC_S3,
		// 		true
		// 	)

		// }
		const package_data = {
			name,
			description,
			price,
			course_ids,
			banner_url,
		}
		const data = await courseService.addCoursePackage(package_data)
		return response.helper(res, true, '_SUCCESS', { data }, 200)
	} catch (err) {
		next(err)
	}
}

const createCourseModule = async (req, res, next) => {
	try {
		const { name, duration, course_id, description, module_index } =
			req.body
		const courseData = await courseService.courseDetails(course_id, 'id')
		if (!courseData) {
			return response.helper(
				res,
				false,
				'COURSE_DETAILS_NOT_FOUND',
				{},
				200
			)
		}
		const lastModule = await courseService.moduleDetails(
			course_id,
			'course_id'
		)
		const courseDataModule = {
			module_index: module_index
				? module_index
				: lastModule?.module_index
				? lastModule.module_index + 1
				: 1,
			course_id,
			description,
			duration,
			name,
		}
		const data = await courseService.addMonduleToCourse(courseDataModule)
		return response.helper(res, true, '_SUCCESS', { moduleData: data }, 200)
	} catch (err) {
		next(err)
	}
}
const createCourseSubModule = async (req, res, next) => {
	try {
		const { name, course_id, module_id } = req.body

		const data = await courseService.addSubModuleToCourse({
			name,
			course_id,
			module_id,
		})
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ subModuleData: data },
			200
		)
	} catch (err) {
		next(err)
	}
}

const createCourseLecture = async (req, res, next) => {
	try {
		const {
			course_id,
			module_id,
			name,
			description,
			lecture_index,
			sub_module_id,
			video_url,
			duration,
		} = req.body
		const courseData = await courseService.courseDetails(course_id, 'id')
		if (!courseData) {
			return response.helper(
				res,
				false,
				'COURSE_DETAILS_NOT_FOUND',
				{},
				200
			)
		}
		const lastModule = await courseService.moduleDetails(
			Number(module_id),
			'id'
		)
		if (!lastModule) {
			return response.helper(
				res,
				false,
				'MDOULE_DETAILS_NOT_FOUND',
				{},
				200
			)
		}
		const lastLecture = await courseService.lectureDetails(
			module_id,
			'module_id'
		)
		let video_thumbnail = ''
		//let video_url = ''
		// if (req.files?.video_thumbnail?.length) {
		// 	const splitDataExt =
		// 		req.files?.video_thumbnail[0].originalname.split('.')
		// 	const ext = splitDataExt[splitDataExt.length - 1]
		// 	const uploadImg = await awsHelper.fileUpload(
		// 		req.files?.video_thumbnail[0].buffer,
		// 		`${courseData.name}/${lastModule.id}/${name}`,
		// 		`thumbnail.${ext}`,
		// 		req.files?.video_thumbnail[0].mimetype,
		// 		config.MS_TUTORIAL_BUCKET
		// 	)
		// 	video_thumbnail = uploadImg.data.Key
		// }

		// if (req.files?.lec_video?.length) {
		// 	const splitDataExt = req.files?.lec_video[0].originalname.split('.')
		// 	const ext = splitDataExt[splitDataExt.length - 1]
		// 	const uploadVideo = await awsHelper.fileUpload(
		// 		req.files?.lec_video[0].buffer,
		// 		`${courseData.name}/${lastModule.id}/${name}`,
		// 		`video.${ext}`,
		// 		req.files?.lec_video[0].mimetype,
		// 		config.MS_TUTORIAL_BUCKET
		// 	)
		// 	console.log(uploadVideo)
		// 	video_url = uploadVideo.data.Key
		// 	duration = req.body.duration
		// 	//  await getVideoDurationInSeconds(uploadVideo.data.Location).then((duration) => {
		// 	// 	return parseFloat(duration / 60).toFixed()
		// 	// });
		// }
		const _sub_module_id = sub_module_id === '0' ? null : sub_module_id
		const modleLectureData = {
			lecture_index: lecture_index
				? lecture_index
				: lastLecture?.lecture_index
				? lastLecture.lecture_index + 1
				: 1,
			course_id,
			module_id,
			video_url,
			duration,
			name,
			description,
			sub_module_id: _sub_module_id,
		}
		const data = await courseService.addLectureToModule(modleLectureData)

		if (req.files?.documents?.length) {
			for (let i = 0; i < req.files.documents.length; i++) {
				const splitDataExt =
					req.files?.documents[0].originalname.split('.')
				const ext = splitDataExt[splitDataExt.length - 1]

				// const ext = req.files?.documents[i].mimetype.split('/')[1];
				const uploadDoc = await awsHelper.fileUpload(
					req.files?.documents[i].buffer,
					`${courseData.name}/${lastModule.id}/${name}`,
					`document_${i + 1}.${ext}`,
					req.files?.documents[i].mimetype,
					config.MS_TUTORIAL_BUCKET
				)
				const docData = {
					lecture_id: data.id,
					doc_name: req.files?.documents[i].originalname,
					doc_url: uploadDoc.data.Key,
				}
				await courseService.addLectureDocument(docData)
			}
		}
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ lectureData: data },
			200
		)
	} catch (err) {
		console.log(err)
		next(err)
	}
}

const setModuleIndexForCourse = async (req, res, next) => {
	try {
		const { module_id, index } = req.body
		const data = await courseService.updateModule(module_id, {
			module_index: index,
		})
		return response.helper(res, true, '_SUCCESS', data, 200)
	} catch (err) {
		next(err)
	}
}

const setLectureIndexForCourse = async (req, res, next) => {
	try {
		const { lecture_id, index } = req.body
		const data = await courseService.updateLecture(lecture_id, {
			lecture_index: index,
		})
		return response.helper(res, true, '_SUCCESS', data, 200)
	} catch (err) {
		next(err)
	}
}
const setLectureThumbnailImage = async (req, res, next) => {
	try {
		const { lecture_id, video_thumbnail } = req.body
		const data = await courseService.updateLecture(lecture_id, {
			video_thumbnail,
		})
		return response.helper(res, true, '_SUCCESS', data, 200)
	} catch (err) {
		next(err)
	}
}

const unpublishCourse = async (req, res, next) => {
	try {
		const {} = req.body
	} catch (err) {
		next(err)
	}
}

const publishCourse = async (req, res, next) => {
	try {
		const { course_id } = req.body
		await courseService.updateCourse(course_id, {
			is_published: 1,
		})
		return response.helper(res, true, 'COURSE_PUBLISHED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const versionReleaseCourse = async (req, res, next) => {
	try {
		const {} = req.body
	} catch (err) {
		next(err)
	}
}

const setExamForModule = async (req, res, next) => {
	try {
		const { examName, courseId, moduleId, instruction, duration } = req.body
		const courseData = await courseService.courseDetails(courseId, 'id')
		if (!courseData) {
			return response.helper(res, false, 'COURSE_NOT_FOUND', {}, 200)
		}
		const moduleData = await courseService.moduleDetails(moduleId, 'id')
		if (!moduleData) {
			return response.helper(
				res,
				false,
				'MDOULE_DETAILS_NOT_FOUND',
				{},
				200
			)
		}
		const examData = await courseService.moduleExamData(courseId, moduleId)
		if (examData) {
			return response.helper(res, false, 'EXAM_ALRADY_EXIST', {}, 200)
		}
		const totalCourseModules = await courseService.moduleList(courseId)
		const totalReword = courseData.price + (courseData.price * 20) / 100
		const examReword = totalReword / totalCourseModules.length
		const newExamData = {
			reward: Number(examReword).toFixed(2),
			course_id: courseId,
			module_id: moduleId,
			name: examName,
			instruction: instruction,
			duration: duration,
		}
		const data = await courseService.addExamToDb(newExamData)
		return response.helper(res, true, '_SUCCESS', { exam: data }, 200)
	} catch (err) {
		next(err)
	}
}

const updateExamForModule = async (req, res, next) => {
	try {
		const {} = req.body
	} catch (err) {
		next(err)
	}
}

const deleteExam = async (req, res, next) => {
	try {
		const {} = req.body
	} catch (err) {
		next(err)
	}
}

const updateCorese = async (req, res, next) => {
	try {
		const {
			course_id,
			name,
			sub_title,
			feature_list,
			learning_points,
			slug,
			description,
			duration,
			price,
			reword,
			active_campagine_tag,
			is_partial_payment_available,
			is_public,
			is_published,
			is_available_pay_mc_wallet,
			document_url,
			is_nft_free,
			active_campagine_list,
			nft_purchase_price,
			brochure_url,
			Is_NFT_Available,
			is_sold_out,
			is_course_restricted_to_users,
		} = req.body
		const isCourseWithSameName = await courseService.courseDetails(
			name,
			'name'
		)
		let uploadImg = null
		if (isCourseWithSameName && course_id != isCourseWithSameName.id) {
			return response.helper(
				res,
				false,
				'COURSE_WITH_NAME_EXIST',
				{},
				200
			)
		}
		if (req.file) {
			const ext = req.file.mimetype.split('/')[1]
			uploadImg = await awsHelper.fileUpload(
				req.file.buffer,
				`${name}`,
				`thumbnail.${ext}`,
				req.file.mimetype,
				config.MS_TUTORIAL_BUCKET
			)
			if (!uploadImg.success) {
				return response.helper(res, false, 'COURSE_CREATION_ERROR', 200)
			}
		}
		const courseData = {
			name,
			sub_title,
			feature_list,
			learning_points,
			slug,
			description,
			duration,
			price,
			reword,
			url_image_thumbnail: uploadImg?.data.Key
				? uploadImg.data.Key
				: undefined,
			active_campagine_tag,
			is_partial_payment_available,
			is_public,
			is_published,
			is_available_pay_mc_wallet,
			document_url,
			is_nft_free,
			active_campagine_list,
			nft_purchase_price,
			brochure_url,
			Is_NFT_Available,
			is_sold_out,
			is_course_restricted_to_users,
		}
		const addCourseToDb = await courseService.updateCourse(
			course_id,
			courseData
		)
		return response.helper(
			res,
			true,
			'COURSE_UPDATED',
			{ courseData: addCourseToDb },
			200
		)
	} catch (err) {
		next(err)
	}
}
const updateModule = async (req, res, next) => {
	try {
		const {} = req.body
	} catch (err) {
		next(err)
	}
}
const updateLecture = async (req, res, next) => {
	try {
		const { lectureId, liveUrl } = req.body
		const lectureData = await courseService.updateLecture(lectureId, {
			live_stream_url: liveUrl,
		})
		return response.helper(res, true, '_SUCCESS', lectureData, 200)
	} catch (err) {
		next(err)
	}
}
const setExamQuestions = async (req, res, next) => {
	try {
		const {
			examId,
			question,
			answers,
			option1,
			option2,
			option3,
			option4,
			rightAnswer,
		} = req.body
		const examData = {
			exam_id: examId,
			question,
			option1: answers[0],
			option2: answers[1],
			option3: answers[2],
			option4: answers[3],
			correct_answer: rightAnswer,
		}
		const data = await courseService.addQuestionToExam(examData)
		return response.helper(res, true, '_SUCCESS', { question: data }, 200)
	} catch (err) {
		next(err)
	}
}
const setExamShuffleIndex = async (req, res, next) => {
	try {
		const { examId, questionId, shuffleIndex } = req.body
		const isSuffleIndexWithQuestionExist =
			await examService.saveUpdateSuffle(examId, questionId, shuffleIndex)
		return response.helper(
			res,
			true,
			'EXAM_SUFFLE_SAVED',
			isSuffleIndexWithQuestionExist,
			200
		)
	} catch (err) {
		logger.error(`Error in set exam shuffle api`)
		next(err)
	}
}

const uploadLecturesWithCSV = async (req, res, next) => {
	try {
		const lectureData = []
		await new Promise((resolve, reject) => {
			fs.createReadStream(req.file.path)
				.pipe(csv())
				.on('data', (data) => {
					const modleLectureData = {
						lecture_index: Number(data.lecture_index) || 1,
						course_id: Number(data.course_id),
						module_id: Number(data.module_id),
						duration: Number(data.duration),
						name: data.lecture_name,
						description: data.lecture_description,
					}
					lectureData.push(modleLectureData)
				})
				.on('end', async () => {
					resolve()
				})
		})
		await courseService.addMultipuleLectureToModule(lectureData)
		fs.unlink(`${global.project_dir}/${req.file.path}`, (err, d) => {
			console.log('err', err)
		})
		return response.helper(res, true, 'LECTURE_ADDED', {}, 200)
	} catch (err) {
		logger.error()
		next(err)
	}
}

const uploadMultipuleVideo = async (req, res, next) => {
	try {
		const { lectureIds } = req.body
		const lectureArr = lectureIds.split(',')
		const [thumbnail] = req.files.thumbnail
		for (let i = 0; i < lectureArr.length; i++) {
			let lec = lectureArr[i]
			try {
				const [file] = req.files[`v${i + 1}`]
				if (file) {
					const lectureDetails = await courseService.lectureDetails(
						lec,
						'id'
					)
					const course = await courseService.courseDetails(
						lectureDetails.course_id,
						'id'
					)

					// for video
					const splitDataExt = file.originalname.split('.')
					const ext = splitDataExt[splitDataExt.length - 1]
					const uploadV = await awsHelper.fileUpload(
						file.buffer,
						`${course.name}/${lectureDetails.module_id}/${lectureDetails.name}`,
						`video.${ext}`,
						file.mimetype,
						config.MS_TUTORIAL_BUCKET
					)
					console.log(uploadV)
					const video = uploadV.data.Key

					// for thumbnail
					const splitDataExtT = thumbnail.originalname.split('.')
					const extT = splitDataExtT[splitDataExtT.length - 1]
					const uploadImg = await awsHelper.fileUpload(
						thumbnail.buffer,
						`${course.name}/${lectureDetails.module_id}/${lectureDetails.name}`,
						`thumbnail.${extT}`,
						thumbnail.mimetype,
						config.MS_TUTORIAL_BUCKET
					)
					const thumbnailT = uploadImg.data.Key
					await courseService.updateLecture(lec, {
						video_thumbnail: thumbnailT,
						video_url: video,
					})
				}
			} catch (err) {
				console.log('err', err)
			}
		}
		return response.helper(res, true, 'VIDEO_UPLOADED', {}, 200)
	} catch (err) {
		logger.error(`Error in uploading Multipule video ${err}`)
		next(err)
	}
}

const uploadQuestionsWithCSV = async (req, res, next) => {
	try {
		const questionsData = req.body
		const promiseList = []

		for (let i = 0; i < questionsData.length; i++) {
			const eachq = questionsData[i]
			const pro = new Promise(async (resolve, reject) => {
				const questions = await courseService.addQuestionToExam(eachq)
				console.log('questions---->', questions)
				await examService.saveUpdateSuffle(
					eachq.exam_id,
					questions.id,
					eachq.shuffle_index
				)
				resolve(questions)
			})
			promiseList.push(pro)
		}
		await Promise.all(promiseList)
		return response.helper(res, true, 'QUESTION_UPLOADED', {}, 200)
	} catch (err) {
		logger.error(`Error in uploading Exam Api ${err}`)
		next(err)
	}
}

const updateMCTHolders = async (req, res, next) => {
	try {
		const holderData = req.body
		const promiseList = []

		for (let i = 0; i < holderData.length; i++) {
			promiseList.push({
				wallet: holderData[i].HolderAddress,
				amount: holderData[i].Balance,
			})
		}
		await userService.saveMCTHolderData(promiseList)
	} catch (err) {
		next(err)
	}
}
const coursePurchaseSummary = async (req, res, next) => {
	try {
		const list = await userService.summaryList()
		return response.helper(res, true, '_SUCCESS', { list }, 200)
	} catch (err) {
		next(err)
	}
}

const lectureDocumentUpdate = async (req, res, next) => {
	try {
		const { lectureId, documentName, documentType } = req.body
		const lectureDetails = await courseService.lectureDetails(
			lectureId,
			'id'
		)
		const courseDetails = await courseService.courseDetails(
			lectureDetails.course_id,
			'id'
		)
		console.log(req.file)
		if (req.file) {
			const splitDataExt = req.file.originalname.split('.')
			const ext = splitDataExt[splitDataExt.length - 1]

			// const ext = req.files?.documents[i].mimetype.split('/')[1];
			const uploadDoc = await awsHelper.fileUpload(
				req.file?.buffer,
				`${courseDetails.name}/${lectureDetails.module_id}/${lectureDetails.name}`,
				`document_${new Date().getTime()}.${ext}`,
				req.file.mimetype,
				config.MS_PUBLIC_S3
			)
			console.log(uploadDoc)
			const docData = {
				lecture_id: lectureId,
				doc_name: documentName,
				doc_url: uploadDoc.data.Location,
				doc_type: documentType,
			}
			console.log(docData)
			await courseService.addLectureDocument(docData)
		}
		return response.helper(res, true, 'DOCUMENT_UPLOADED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const getUserCourseRemainders = async (req, res, next) => {
	try {
		const list = await courseService.getUserCourseRemainders()
		return response.helper(res, true, '_SUCCESS', { list }, 200)
	} catch (err) {
		next(err)
	}
}

const enableRemainderNotifications = async (req, res, next) => {
	try {
		const { course_id, is_remainder_notifications_enabled } = req.body
		const o = await courseService.enableRemainderNotifications(
			course_id,
			is_remainder_notifications_enabled,
			req.user.id
		)

		return response.helper(res, true, '_SUCCESS', { list: o }, 200)
	} catch (err) {
		next(err)
	}
}
const getCourseLectures = async (req, res, next) => {
	const { courseId } = req.params
	const list = await db.sequelize.query(
		`select l.id ,concat(m.name,' | ',l.name )as name from course_modules m join course_lectures l on l.module_id = m.id where m.course_id = ${courseId};`
	)
	return response.helper(res, true, 'COURSE_LECTURES', list[0], 200)
}
const getVatRateByCode = async (req, res, next) => {
	const { code } = req.params
	const data = await courseService.getVateRateByCountryCode(code)
	return response.helper(res, true, 'VAT_RATES', data, 200)
}

module.exports = {
	lectureDocumentUpdate,
	updateMCTHolders,
	uploadQuestionsWithCSV,
	uploadMultipuleVideo,
	uploadLecturesWithCSV,
	setExamShuffleIndex,
	createCourse,
	createCoursePackages,
	createCourseModule,
	createCourseLecture,
	setModuleIndexForCourse,
	setLectureIndexForCourse,
	unpublishCourse,
	publishCourse,
	versionReleaseCourse,
	setExamForModule,
	updateExamForModule,
	deleteExam,
	updateCorese,
	updateModule,
	updateLecture,
	setExamQuestions,
	coursePurchaseSummary,
	getUserCourseRemainders,
	enableRemainderNotifications,
	createCourseSubModule,
	getCourseLectures,
	getVatRateByCode,
	setLectureThumbnailImage,
}
