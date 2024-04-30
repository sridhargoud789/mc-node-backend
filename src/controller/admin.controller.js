const fs = require('fs')
const csvWriter = require('csv-write-stream')
const config = require('../config/config')
const logger = require('../config/logger')
const dbObj = require('../../models/index')

const db = require('../../models')
const { usersCourseData } = require('../dbService/admin.services')
const awsHelper = require('../helpers/aws.helper')
const response = require('../helpers/response.helper')
const commonService = require('../dbService/common.service')
const commonHelper = require('../helpers/common.helper')
const userService = require('../dbService/user.service')
const courseService = require('../dbService/course.services')
const paymentService = require('../dbService/payment.service')
const adminService = require('../dbService/admin.services')
const moduleService = require('../dbService/module.services')
const mailHelper = require('../helpers/email.helper')
const moment = require('moment')
const activeCampagineHelper = require('../helpers/activecampaign')
const env = config.NODE_ENV || 'development'
const courseUserModel = dbObj.courses_users
const accountSid = 'AC6d9cd24c093a42df79c8c9911e490edb'
const authToken = '62b83d76f6b8fba0f843975182d500f5'
const client = require('twilio')(accountSid, authToken)
const coinbaseCommerceHelper = require('../helpers/coinbase.helper')
const addDataToSheet = require('../helpers/addDataToSheet.helper')
const quickBookService = require('../dbService/quickbook.service')
const getUserAssignedCourseList = async (req, res, next) => {
	try {
		const dbData = await usersCourseData()

		let finalData = []

		dbData.forEach((ele) => {
			ele['course_ids'] = []

			const existing = dbData.filter((v) => {
				return v.user_id == ele.user_id
			})

			if (existing.length) {
				const existingIndex = dbData.indexOf(existing[0])
				dbData[existingIndex].course_id = dbData[existingIndex][
					'course_ids'
				].push(ele.course_id)
			} else {
				dbData.push([ele.course_id])
			}
		})

		finalData = dbData.filter((e) => {
			return e['course_ids'].length > 0
		})

		return response.helper(res, true, 'DATA_FOUND', finalData, 200)
	} catch (error) {
		next(error)
	}
}

const assignCourseToUser = async (req, res, next) => {
	try {
		const { userIds, courseIds, reward } = req.body
		const tokenAv = await commonService.calculateTokenAvg()
		const responseData = commonHelper.avgPriceOfMCT(tokenAv)
		const mctAmount = responseData.price
		for (let i = 0; i < userIds.length; i++) {
			const userDetails = await userService.userDetails(userIds[i])
			if (userDetails) {
				//console.log(userDetails)
				for (let i = 0; i < courseIds.length; i++) {
					let userId = userDetails.id
					const courseId = courseIds[i]
					const isCourseWithSameName =
						await courseService.courseDetails(courseId, 'id')
					if (!isCourseWithSameName) {
						continue
					}
					const isCourseAlreadyPurchased =
						await courseService.userCourseData(courseId, userId)
					if (isCourseAlreadyPurchased) {
						continue
					}
					let purchaseAmount = Number(
						isCourseWithSameName.price / mctAmount
					).toFixed(2)
					let rewardAmount =
						isCourseWithSameName.price +
						(isCourseWithSameName.price * 20) / 100
					const historyUser = {
						course_id: courseId,
						user_id: userId,
						stripe_id: 'Manual_Add_By_Admin',
						status: 1,
					}
					await courseService.addCourseToUserTransaction(historyUser)
					const prepareCourseHistory = {
						course_id: courseId,
						user_id: userId,
						started_at: null,
						purchased_amount: purchaseAmount, // storing in mct
						reward_amount: reward ? rewardAmount : 0,
						total_reward_earned: 0,
						mct_price_at_purchase: mctAmount,
						transaction_id: 'Manual_Add_By_Admin',
					}
					await courseService.addCourseToUserData(
						prepareCourseHistory
					)
				}
				// return response.helper(
				// 	res,
				// 	true,
				// 	'COURSE_ASSIGN_SUCCESS',
				// 	{},
				// 	200
				// )
			} else {
				//return response.helper(res, false, 'USER_NOT_EXIST', {}, 200)
			}
			return response.helper(res, true, 'COURSE_ASSIGN_SUCCESS', {}, 200)
		}
	} catch (err) {
		next(err)
	}
}

const userList = async (req, res, next) => {
	try {
		const { page, limit, search } = req.query
		const list = await userService.list(limit, page, search)
		return response.helper(res, true, 'USER_LIST', list, 200)
	} catch (err) {
		next(err)
	}
}

const stripePaymentSummary = async (req, res, next) => {
	const data = await paymentService.stripePayments()
	let writer = csvWriter({
		headers: [
			'Payment Method',
			'Transaction Id',
			'Product Name',
			'User Id',
			'Amount',
			'User Ip',
			'Txn Time',
			'Email',
			'User Name',
			'Contact',
			'Address 1',
			'Address 2',
			'State',
			'Country',
			'Zip Code',
		],
	})
	res.setHeader('Content-type', 'application/csv')
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader(
		'Content-disposition',
		'attachment; filename=Transactions.csv'
	)
	writer.pipe(res)
	data.forEach((eachData) => {
		writer.write([
			'stripe',
			eachData.stripe_id,
			eachData.courseName,
			eachData.user_id,
			eachData.amount,
			eachData.user_ip,
			eachData.created_at,
			eachData.email,
			eachData.userName,
			eachData.phone_number,
			eachData.addressData?.address_line_1,
			eachData.addressData?.address_line_2,
			eachData.addressData?.state,
			eachData.addressData?.country,
			eachData.addressData?.zip_code,
		])
	})
	writer.end()
}

const coinbasePaymentSummary = async (req, res, next) => {
	const data = await paymentService.coinbasePayments()
	let writer = csvWriter({
		headers: [
			'Payment Method',
			'Transaction Id',
			'Product Name',
			'User Id',
			'Amount',
			'User Ip',
			'Txn Time',
			'Email',
			'User Name',
			'Contact',
			'Address 1',
			'Address 2',
			'State',
			'Country',
			'Zip Code',
		],
	})
	res.setHeader('Content-type', 'application/csv')
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Content-disposition', 'attachment; filename=Coinbase.csv')
	writer.pipe(res)
	data.forEach((eachData) => {
		writer.write([
			'coinbase',
			eachData.coinbase_id,
			eachData.courseName,
			eachData.user_id,
			eachData.amount.pricing.local.amount,
			eachData.user_ip,
			eachData.created_at,
			eachData.email,
			eachData.userName,
			eachData.phone_number,
			eachData.addressData?.address_line_1,
			eachData.addressData?.address_line_2,
			eachData.addressData?.state,
			eachData.addressData?.country,
			eachData.addressData?.zip_code,
		])
	})
	writer.end()
}

const mctPaymentSummary = async (req, res, next) => {
	const data = await paymentService.mctPayments()
	let writer = csvWriter({
		headers: [
			'Payment Method',
			'Transaction Id',
			'Product Name',
			'User Id',
			'Amount',
			'User Ip',
			'Txn Time',
			'Email',
			'User Name',
			'Contact',
			'Address 1',
			'Address 2',
			'State',
			'Country',
			'Zip Code',
		],
	})
	res.setHeader('Content-type', 'application/csv')
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Content-disposition', 'attachment; filename=Coinbase.csv')
	writer.pipe(res)
	data.forEach((eachData) => {
		writer.write([
			'mct',
			eachData.transaction_id,
			eachData.courseName,
			eachData.user_id,
			eachData.amount,
			eachData.user_ip,
			eachData.created_at,
			eachData.email,
			eachData.userName,
			eachData.phone_number,
			eachData.addressData?.address_line_1,
			eachData.addressData?.address_line_2,
			eachData.addressData?.state,
			eachData.addressData?.country,
			eachData.addressData?.zip_code,
		])
	})
	writer.end()
}

const updateCourseModule = async (req, res, next) => {
	try {
		const {
			moduleId,
			name,
			description,
			duration,
			language,
			module_index,
		} = req.body
		const courseDetails = await moduleService.updateModule(moduleId, {
			name,
			description,
			duration,
			module_index,
		})
		return response.helper(res, true, 'MODULE_UPDATED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const updateLectureSubModule = async (req, res, next) => {
	try {
		const { lectureId, sub_module_id } = req.body
		const data = await courseService.updateLecture(lectureId, {
			sub_module_id,
		})
		return response.helper(res, true, 'LECTURE_SUBMOULE_UPDATED', data, 200)
	} catch (err) {
		next(err)
	}
}

const updateModuleLecture = async (req, res, next) => {
	try {
		const language = req.headers.language
		const {
			lectureId,
			name,
			description,
			duration,
			lecture_index,
			course_id,
			module_id,
			video_url,
		} = req.body
		// const lectureDetails = language
		// 	? await courseService.lectureDetailsMultiLang(
		// 			lectureId,
		// 			'lecture_id'
		// 	  )
		// 	: await courseService.lectureDetails(lectureId, 'id')
		const lectureDetails = await courseService.lectureDetails(
			lectureId,
			'id'
		)

		const courseDetails = await courseService.courseDetails(course_id, 'id')
		const updateData = {
			name: name,
			duration,
			description,
			lecture_index,
			video_url,
		}
		// if (req.file) {
		// 	const file = req.file
		// 	// for video
		// 	const splitDataExt = file.originalname.split('.')
		// 	const ext = splitDataExt[splitDataExt.length - 1]
		// 	let filename = `${courseDetails.name}/${module_id}/${lectureDetails.name}`
		// 	// if (language) {
		// 	// 	filename = `${courseDetails.name}/en/${module_id}/${lectureDetails.name}`
		// 	// }
		// 	const uploadV = await awsHelper.fileUpload2(
		// 		file.buffer,
		// 		filename,
		// 		`video.${ext}`,
		// 		file.mimetype,
		// 		config.MS_TUTORIAL_BUCKET
		// 	)
		// 	const video = uploadV.data.Key
		// 	updateData.video_url = video
		// }
		await courseService.updateLecture(lectureId, updateData)
		// if (language) {
		// 	await courseService.updateLectureMultiLang(lectureId, updateData)
		// } else {
		// 	await courseService.updateLecture(lectureId, updateData)
		// }
		return response.helper(res, true, 'LECTURE_UPDATED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const listAllCourse = async (req, res, next) => {
	try {
		const list = await courseService.adminCourseList(req.headers.language)

		return response.helper(res, true, 'LIST_COURSE', { list }, 200)
	} catch (err) {
		next(err)
	}
}

const courseDetails = async (req, res, next) => {
	try {
		const { courseId } = req.params
		const data = await courseService.getCourseAdminDetails(
			courseId,
			true,
			req.headers.language
		)
		const [examList] = await courseService.examList(courseId)
		if (data.is_public) {
			data.dataValues.reward = examList?.reward || null
		}
		if (!data) {
			return response.helper(res, false, 'COURSE_NOT_FOUND', {}, 200)
		}
		return response.helper(res, true, '_SUCCESS', { courseData: data }, 200)
	} catch (err) {
		next(err)
	}
}

const removeDocument = async (req, res, next) => {
	try {
		const { documentId } = req.body
		const removeDoc = await courseService.removeDocFromAws(documentId)
		return response.helper(res, true, 'DOCUMENT_DELETED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const removeLecture = async (req, res, next) => {
	try {
		const { lecture_id } = req.body
		const removeDoc = await courseService.deleteLecture(lecture_id)
		return response.helper(res, true, 'LECTURE_DELETED', {}, 200)
	} catch (err) {
		next(err)
	}
}
const removeModule = async (req, res, next) => {
	try {
		const { module_id } = req.body
		const removeDoc = await courseService.deleteModule(module_id)
		return response.helper(res, true, 'MODULE_DELETED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const addWalletTokens = async (req, res, next) => {
	try {
		const { amount, userId } = req.body
		const userWalletDetails = await userService.walletData(userId)
		await userService.deductMctFromWallet(userId, {
			token_balance: userWalletDetails.token_balance + amount,
		})
		await userService.addWalletHistory({
			user_id: userId,
			amount: amount,
			transaction_type: 'credit',
		})
		return response.helper(res, true, 'AMOUNT_ADDED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const removeWalletTokens = async (req, res, next) => {
	try {
		const { amount, userId } = req.body
		const userWalletDetails = await userService.walletData(userId)
		await userService.deductMctFromWallet(userId, {
			token_balance: userWalletDetails.token_balance - Math.abs(amount),
		})
		await userService.addWalletHistory({
			user_id: userId,
			amount: -Math.abs(amount),
			transaction_type: 'debit',
		})
		return response.helper(res, true, 'AMOUNT_REMOVED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const removeCourseAccess = async (req, res, next) => {
	try {
		const { userId, courseId } = req.body
		const courseHistory = await courseService.userCourseData(
			courseId,
			userId
		)
		if (!courseHistory) {
			return response.helper(
				res,
				false,
				'user not purchased course',
				{},
				404
			)
		}
		await adminService.removeCourseFromUser(userId, courseId)
		return response.helper(
			res,
			true,
			'course access removed successfully',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const removeCourseAccessWithRefund = async (req, res, next) => {
	try {
		const { userId, courseId, is_refund, refund_amount, currency_type } =
			req.body
		const courseHistory = await courseService.userCourseData(
			courseId,
			userId
		)
		if (!courseHistory) {
			return response.helper(
				res,
				false,
				'user not purchased course',
				{},
				404
			)
		}
		const courseDetails = await courseService.courseDetails(courseId, 'id')
		const user = await userService.userDetails(userId)

		const userCourseData = await courseUserModel.findOne({
			where: {
				course_id: courseId,
				user_id: userId,
				status: 1,
			},
			attributes: [
				'id',
				'course_id',
				'package_id',
				'discount_id',
				'user_id',
				'coinbase_id',
				'paypal_id',
				'stripe_id',
				'transaction_id',
				'status',
				'address_id',
				'referal_user_id',
				'is_discount_used',
				'used_discount_id',
				'is_partial_payment',
				'payment_devied_in',
				'remian_payments',
				'next_payment_date',
				'each_payment_amount',
				'payment_details',
				'purchase_amount_usd',
				'sales_agent',
			],
		})

		try {
			const amount = is_refund === 1 ? `-${refund_amount}` : ``
			const _currency_type =
				currency_type === 'USD'
					? '$'
					: currency_type === 'EUR'
					? '€'
					: '$'
			const gReq = {
				course_name: courseDetails.name,
				name: user.name,
				email: user.email,
				phone: user.phone_number,
				payment_date: moment().format('DD-MMM-YYYY'),
				payment_amount: `${_currency_type}${amount}`,
				payment_divided_in: '',
				payment_method: is_refund === 1 ? 'Refund' : 'No Refund',
				merchant: 'Manual_Removed_By_Admin',
				sales_agent: userCourseData.sales_agent,
			}
			await addDataToSheet.addPurchasedDataToGoogleSheet(gReq)
			await addDataToSheet.addPurchasedSalesAgentToGS(gReq)
		} catch (error) {
			logger.error(
				`admin panel remove course error at google sheet ${error}`
			)
		}
		await adminService.removeCourseFromUser(userId, courseId)
		return response.helper(
			res,
			true,
			'course access removed successfully',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const assignCourseToMintNft = async (req, res, next) => {
	try {
		const { userIds, courseIds } = req.body
		const tokenAv = await commonService.calculateTokenAvg()
		const responseData = commonHelper.avgPriceOfMCT(tokenAv)
		const mctAmount = responseData.price
		for (let i = 0; i < userIds.length; i++) {
			const userDetails = await userService.userDetails(userIds[i])
			if (userDetails) {
				for (let i = 0; i < courseIds.length; i++) {
					let userId = userDetails.id
					const courseId = courseIds[i]
					const isCourseWithSameName =
						await courseService.courseDetails(courseId, 'id')
					if (!isCourseWithSameName) {
						continue
					}
					const isCourseAlreadyPurchased =
						await courseService.userCourseData(courseId, userId)
					if (isCourseAlreadyPurchased) {
						continue
					}
					let purchaseAmount = Number(
						isCourseWithSameName.price / mctAmount
					).toFixed(2)
					const historyUser = {
						course_id: courseId,
						user_id: userId,
						stripe_id: 'Manual_Add_By_Admin',
						status: 1,
					}
					await courseService.addCourseToUserTransaction(historyUser)
					const prepareCourseHistory = {
						course_id: courseId,
						user_id: userId,
						started_at: '2023-05-01',
						completed_at: '2023-05-05',
						purchased_amount: purchaseAmount, // storing in mct
						reward_amount: 0,
						progress: 100,
						mct_price_at_purchase: mctAmount,
						transaction_id: 'Manual_Add_By_Admin',
					}
					await courseService.addCourseToUserData(
						prepareCourseHistory
					)
				}
				return response.helper(
					res,
					true,
					'COURSE_ASSIGN_SUCCESS',
					{},
					200
				)
			} else {
				return response.helper(res, false, 'USER_NOT_EXIST', {}, 200)
			}
		}
	} catch (err) {
		next(err)
	}
}

const userDetails = async (req, res, next) => {
	try {
		const { userId } = req.params
		const userDeatils = await userService.userDetails(userId)
		const userWalletDetails = await userService.isUserHaveDefaultWallet(
			userId
		)
		const userMcWalletDetails = await userService.walletData(userId)
		const userCourses = await courseService.listUserCourses(userId)
		return response.helper(
			res,
			true,
			'USER_DETAILS',
			{
				userDeatils,
				userWalletDetails,
				userMcWalletDetails,
				userCourses,
			},
			200
		)
	} catch (err) {
		next(err)
	}
}

const userListByCourse = async (req, res, next) => {
	try {
		const { courseId } = req.body
		const userListByCourse = await adminService.usersByCourse(courseId)
		return response.helper(
			res,
			true,
			'USER_LIST_BY_COURSE',
			userListByCourse,
			200
		)
	} catch (err) {
		next(err)
	}
}

const userExamDetailsByCourse = async (req, res, next) => {
	try {
		const { courseId, userId } = req.body
		const examList = await adminService.userExamsByCourse(courseId, userId)
		return response.helper(res, true, 'USER_EXAMS', examList, 200)
	} catch (err) {
		next(err)
	}
}

const pendingPaymentList = async (req, res, next) => {
	const list = await db.sequelize.query(
		'select u.name,u.email,u.phone_number,c.name as coursename,cu.each_payment_amount,cu.next_payment_date, cu.payment_devied_in from courses_users cu join courses c on cu.course_id = c.id join users u on u.id = cu.user_id where cu.is_partial_payment=1 and cu.each_payment_amount is not null and cu.next_payment_date is not null'
	)
	return response.helper(res, true, 'PAYMENT_LIST', list, 200)
}

const getUsersAssignedToCourse = async (req, res, next) => {
	const { courseId } = req.body
	const query = `SELECT
	c.id as course_id,
	u.id AS user_id,
    u.email,
    u.name,
    u.phone_number,
    u.employee_company,
    u.is_module_1_submitted,
    u.is_module_2_submitted,
    u.is_module_3_submitted,
    u.is_module_4_submitted,
    u.is_module_5_submitted,
    u.is_module_6_submitted,
    u.is_module_7_submitted,
    u.is_module_8_submitted,
    u.is_module_9_submitted,
    u.is_module_10_submitted,
    u.is_module_11_submitted,
    u.is_module_12_submitted,
    u.is_module_13_submitted,
    u.is_module_14_submitted,
    c.name as course_name,
    cu.id AS courses_users_id,
    huc.id AS history_user_courses_id,
    cu.status,
    cu.stripe_id,
    cu.payment_devied_in,
    cu.remian_payments,
	cu.payment_details,
    cu.each_payment_amount,
    cu.next_payment_date,
    cu.next_payment_stripe_id,
    huc.started_at,
    huc.completed_at
FROM
    users u
        INNER JOIN
    courses_users cu ON cu.user_id = u.id AND cu.course_id = ${courseId}
        AND cu.status = 1
        INNER JOIN
    courses c ON c.id = cu.course_id
        INNER JOIN
    history_user_courses huc ON huc.user_id = cu.user_id
        AND huc.course_id = cu.course_id
	`
	const list = await db.sequelize.query(query)
	return response.helper(res, true, 'Users List', list[0], 200)
}

const hotMartController = async (req, res, next) => {
	const _data = {
		id: '6ec33e51-ef2d-4202-92e9-5cc6ebbf92ea',
		creation_date: 1709043597789,
		event: 'PURCHASE_APPROVED',
		version: '2.0.0',
		data: {
			product: {
				id: 3242299,
				ucode: 'd0ddbf70-68ed-4a93-938c-be14cf6fad05',
				name: 'Master Elite del Trading',
				has_co_production: false,
			},
			affiliates: [
				{
					affiliate_code: '',
					name: '',
				},
			],
			buyer: {
				email: 'semidanarvelo1234@gmail.com',
				name: 'Semidán Nahazet Arvelo Hernández ',
				checkout_phone: '34602627222',
				address: {
					city: 'Santa Cruz de Tenerife ',
					country: 'Spain',
					country_iso: 'ES',
					state: 'IC',
					zipcode: '38500',
					address: 'urbanización afonso carrilo b12 3D',
					complement: '12 3D',
				},
				document: '79099912Z',
			},
			producer: {
				name: 'EVIVA E D COMPUTER TRAINING LLC',
			},
			commissions: [
				{
					value: 90.37,
					source: 'MARKETPLACE',
					currency_value: 'EUR',
				},
				{
					value: 1886.66,
					source: 'PRODUCER',
					currency_value: 'EUR',
				},
			],
			purchase: {
				approved_date: 1709043592000,
				full_price: {
					value: 1997,
					currency_value: 'EUR',
				},
				price: {
					value: 1997,
					currency_value: 'EUR',
				},
				checkout_country: {
					name: 'Spain',
					iso: 'ES',
				},
				order_bump: {
					is_order_bump: false,
				},
				buyer_ip: '90.74.150.111',
				original_offer_price: {
					value: 1997,
					currency_value: 'EUR',
				},
				order_date: 1709043411000,
				status: 'APPROVED',
				transaction: 'HP3419779002',
				payment: {
					installments_number: 1,
					type: 'SEQURA',
				},
				offer: {
					code: '8b6wyhd3',
				},
				invoice_by: 'SELLER',
				subscription_anticipation_purchase: false,
			},
		},
	}
	const data = req.body
	const courseName = data.data.product.name
	const buyer = data.data.buyer
	const address_line1 = buyer.address.address
	const state = buyer.address.state
	const city = buyer.address.city
	const country = buyer.address.country

	const buyerIP = data.data.purchase.buyer_ip
	const paid_amount = data.data.purchase.price.value
	const currency_type = data.data.purchase.price.currency_value
	const courseId = 56 //courseName === 'Master Elite del Trading' ? 56 : 55
	try {
		const email = buyer.email
		const name = buyer.name
		const phone_number = buyer.checkout_phone
		const partialTime = 0
		const stripe_id = 'NA'
		const sales_agent = 4

		let userId = 0
		let activeCampaignDealId = 0
		let activeCampaignDealValue = 0
		let activeCampaignContactId = 0
		let activeCampagineUserId
		let user = null
		const userExist = await userService.isEmailExist(email)
		if (userExist) {
			const _user = await userService.userLoginData(userExist.id)
			user = _user
			userId = _user.id
		} else {
			console.log('userExistnot')
			const userRoleData = await userService.userRoleData('USR')
			const decryptPassword = `Test@123` //commonHelper.rendomString();
			const hash = commonHelper.shaPassword(decryptPassword)
			const level = await userService.levelDetailsByCode('PRI')
			const userData = {
				name,
				email,
				password: hash,
				accept_private_policy: 1,
				phone_number,
				role_id: userRoleData.id,
				level_id: level.id,
				is_phone_verified: 0,
				address_line1,
				state,
				city,
				country,
			}
			user = await userService.saveUser(userData)
			await mailHelper.sendEmail({
				type: 'account-create',
				data: {
					email,
					FRONT_DOMAIN: process.env.FRONT_DOMAIN,
					password: decryptPassword,
					username: name,
				},
			})

			const activeCampagineData = {
				contact: {
					email,
					firstName: name,
					phone: phone_number,
				},
			}

			try {
				const activeCampagineUserExist =
					await activeCampagineHelper.contectFetchByEmail(email)
				if (
					activeCampagineUserExist &&
					activeCampagineUserExist?.data?.contacts?.length
				) {
					const [activeCampagineUser] =
						activeCampagineUserExist.data.contacts
					activeCampagineUserId = activeCampagineUser.id
				} else {
					const {
						data: {
							contact: { id },
						},
					} = await activeCampagineHelper.createContact(
						activeCampagineData
					)
					activeCampagineUserId = id
				}

				await activeCampagineHelper.addContactToList(
					activeCampagineUserId
				)
			} catch (err) {
				logger.error('failling becaus of active campagine')
			}
			userId = user.id
		}

		const isCourseAlreadyPurchased = await courseService.userCoursesDetails(
			courseId,
			userId
		)
		try {
			const activeCampaignDealResp =
				await activeCampagineHelper.getDealByPhoneNo(
					user.phone_number,
					70
				)

			if (activeCampaignDealResp.data.deals[0] !== undefined) {
				activeCampaignDealId = activeCampaignDealResp.data.deals[0].id
				activeCampaignDealValue =
					activeCampaignDealResp.data.deals[0].value
				activeCampaignContactId =
					activeCampaignDealResp.data.deals[0].contact
			} else {
				const resp2 = await activeCampagineHelper.getDealByPhoneNo(
					user.email,
					70
				)
				if (resp2.data.deals[0] !== undefined) {
					activeCampaignDealId = resp2.data.deals[0].id
					activeCampaignDealValue = resp2.data.deals[0].value
					activeCampaignContactId = resp2.data.deals[0].contact
				}
			}
		} catch (error) {
			logger.error(`Admin panel error at active campaign ${error}`)
		}

		if (!isCourseAlreadyPurchased) {
			const courseHistoryList = []
			const courseDetails = await courseService.courseDetails(
				courseId,
				'id'
			)
			console.log(`creating purchase for ${userId}`)
			const ppOBJ = JSON.parse(courseDetails.partialpay_stripe_price_obj)
			let amount = 0
			let strPaymentDetails = ''
			let courseUserTransactionData = {}
			if (partialTime === 0) {
				courseUserTransactionData = {
					course_id: courseId,
					user_id: userId,
					stripe_id,
					status: 1,
					is_partial_payment: 0,
					user_ip: buyerIP,
					payment_details: `$${ppOBJ[partialTime].original_price}`,
					sales_agent,
				}
				const userCourse =
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
				courseHistoryList.push(userCourse)
				amount = ppOBJ[partialTime].original_price
				strPaymentDetails = `$${ppOBJ[partialTime].original_price}`
			} else if (partialTime === -1) {
				courseUserTransactionData = {
					course_id: courseId,
					user_id: userId,
					stripe_id: 'Manual_Add_By_Admin',
					status: 1,
					is_partial_payment: 0,
					user_ip: '',
					payment_details: `Free`,
					payment_devied_in: 0,
					sales_agent,
				}
				const userCourse =
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
				courseHistoryList.push(userCourse)
				amount = 0
				strPaymentDetails = `Free`
			} else {
				if (
					partialTime === 1 ||
					partialTime === 2 ||
					partialTime === 4 ||
					partialTime === 6 ||
					partialTime === 10 ||
					partialTime === 11 ||
					partialTime === 12 ||
					partialTime === 13
				) {
					amount = ppOBJ[partialTime].original_price
					strPaymentDetails = `${ppOBJ[partialTime].emis} X $${ppOBJ[partialTime].original_price}`
				} else {
					amount = ppOBJ[partialTime].emi[0].original_price
					strPaymentDetails = `$${
						ppOBJ[partialTime].emi[0].original_price
					} + (${ppOBJ[partialTime].emis - 1} X $${
						ppOBJ[partialTime].emi[1].original_price
					})`
					console.log('amountset2--->', amount)
				}
				courseUserTransactionData = {
					course_id: courseId,
					user_id: userId,
					stripe_id,
					status: 1,
					is_partial_payment: 1,
					next_payment_date: moment().add(30, 'days'),
					payment_devied_in: ppOBJ[partialTime].emis,
					remian_payments: ppOBJ[partialTime].emis - 1,
					each_payment_amount:
						partialTime === 1
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 2
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 4
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 6
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 10
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 11
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 12
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 13
							? ppOBJ[partialTime].price_with_tax
							: ppOBJ[partialTime].emi[1].original_price,
					user_ip: '',
					next_payment_stripe_id:
						partialTime === 1
							? ppOBJ[partialTime].stripeid
							: partialTime === 2
							? ppOBJ[partialTime].stripeid
							: partialTime === 4
							? ppOBJ[partialTime].stripeid
							: partialTime === 6
							? ppOBJ[partialTime].stripeid
							: partialTime === 10
							? ppOBJ[partialTime].stripeid
							: partialTime === 11
							? ppOBJ[partialTime].stripeid
							: partialTime === 12
							? ppOBJ[partialTime].stripeid
							: partialTime === 13
							? ppOBJ[partialTime].stripeid
							: ppOBJ[partialTime].emi[1].stripeid,
					payment_details: strPaymentDetails,
					sales_agent,
				}
				const userCourse =
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
				courseHistoryList.push(userCourse)
			}
			if (partialTime !== -1) {
				const _amount =
					paid_amount === 0
						? ppOBJ[partialTime].original_price
						: paid_amount
				quickBookService.createInvoice(
					userId,
					courseId,
					_amount,
					currency_type
				)
			}

			const prepareCourseHistory = {
				course_id: courseId,
				user_id: userId,
				started_at: null,
				// purchased_amount: Number(amount / mctPriceAtPurchase).toFixed(2),
				total_reward_earned: 0,
				// mct_price_at_purchase: mctPriceAtPurchase,
				transaction_id: stripe_id,
			}
			await courseService.addCourseToUserData(prepareCourseHistory)
			try {
				if (parseInt(courseId) === 55) {
					await commonHelper.purchaseDineroDesbloqueadoMail(userId)
					const phno =
						user.phone_number.indexOf('+') === -1
							? '+' + user.phone_number
							: user.phone_number
					client.messages
						.create({
							body: `Hola ${user.name},
											Bienvenido a la mentoría de Dinero Desbloqueado. Para facilitar tu acceso al curso, también te hemos enviado un correo electrónico con instrucciones paso a paso a la dirección que utilizaste para realizar la compra. Este correo incluye tu nombre de usuario y contraseña, en caso de que aún no estés registrado en nuestra plataforma. Por favor, responde a este mensaje con un "Sí" si deseas instrucciones y soporte a través de WhatsApp.`,
							from: 'whatsapp:+14704659604',
							to: `whatsapp:${phno}`,
						})
						.then((message) => console.log(message.sid))
					if (activeCampaignDealId !== 0) {
						await activeCampagineHelper.updateActiveCampaignDeal(
							{
								deal: {
									stage: '842',
									currency: 'usd',
									value: amount,
									fields: [
										{
											customFieldId: 3,
											fieldValue: moment()
												.add(30, 'days')
												.format('DD-MMM-YYYY'),
										},
										{
											customFieldId: 4,
											fieldValue:
												courseUserTransactionData.payment_details,
										},
										{
											customFieldId: 5,
											fieldValue:
												courseUserTransactionData.remian_payments -
												1,
										},
									],
								},
							},
							activeCampaignDealId
						)

						await activeCampagineHelper.addTagsToContact(
							activeCampaignContactId,
							555
						)
					}
				}
				if (parseInt(courseId) === 56 && partialTime === 0) {
					const _amountNew =
						paid_amount === 0
							? ppOBJ[partialTime].original_price
							: paid_amount
					if (activeCampaignDealId !== 0) {
						await activeCampagineHelper.updateActiveCampaignDeal(
							{
								deal: {
									stage: '852',
									currency: 'usd',
									value: _amountNew * 100,
									status: 1,
								},
							},
							activeCampaignDealId
						)
					} else {
						await activeCampagineHelper.createActiveCampaignDeal({
							deal: {
								contact: activeCampagineUserId,
								description:
									'Deal created from mundocrypto.com',
								currency: 'usd',
								group: '70',
								owner: '1',
								percent: null,
								stage: '852',
								status: 1,
								title: user.name,
								value: _amountNew * 100,
							},
						})
					}
					await activeCampagineHelper.addContactToAutomation({
						contactAutomation: {
							contact: activeCampagineUserId,
							automation: '334',
						},
					})
				}
				const _amountNew =
					paid_amount === 0
						? ppOBJ[partialTime].original_price
						: paid_amount
				const _currency_type =
					currency_type === 'USD'
						? '$'
						: currency_type === 'EUR'
						? '€'
						: '$'
				const gReq = {
					course_name: courseDetails.name,
					name: user.name,
					email: user.email,
					phone: user.phone_number,
					payment_date: moment().format('DD-MMM-YYYY'),
					payment_amount: `${_currency_type}${_amountNew}`,
					payment_divided_in:
						courseUserTransactionData.payment_devied_in,
					payment_method: courseUserTransactionData.payment_details,
					merchant: 'Manual_Add_By_Admin',
					sales_agent,
				}
				await addDataToSheet.addPurchasedDataToGoogleSheet(gReq)
				await addDataToSheet.addPurchasedSalesAgentToGS(gReq)
			} catch (error) {
				logger.error(`admin panel error at google sheet ${error}`)
			}
			console.log('completed')
		}
		return response.helper(res, true, 'USER_ASSIGN_SUCCESS', {}, 200)
	} catch (err) {
		logger.error(`admin panel error ${err}`)
		next(err)
	}
}
const addUserAndAssignCourse = async (req, res, next) => {
	try {
		const {
			email,
			name,
			phone_number,
			partialTime,
			stripe_id,
			courseId,
			sales_agent,
			paid_amount,
			currency_type,
		} = req.body
		let userId = 0
		let activeCampaignDealId = 0
		let activeCampaignDealValue = 0
		let activeCampaignContactId = 0
		let activeCampagineUserId
		let user = null
		const userExist = await userService.isEmailExist(email)
		if (userExist) {
			const _user = await userService.userLoginData(userExist.id)
			user = _user
			userId = _user.id
		} else {
			console.log('userExistnot')
			const userRoleData = await userService.userRoleData('USR')
			const decryptPassword = `Test@123` //commonHelper.rendomString();
			const hash = commonHelper.shaPassword(decryptPassword)
			const level = await userService.levelDetailsByCode('PRI')
			const userData = {
				name,
				email,
				password: hash,
				accept_private_policy: 1,
				phone_number,
				role_id: userRoleData.id,
				level_id: level.id,
				is_phone_verified: 0,
			}
			user = await userService.saveUser(userData)
			await mailHelper.sendEmail({
				type: 'account-create',
				data: {
					email,
					FRONT_DOMAIN: process.env.FRONT_DOMAIN,
					password: decryptPassword,
					username: name,
				},
			})

			const activeCampagineData = {
				contact: {
					email,
					firstName: name,
					phone: phone_number,
				},
			}

			try {
				const activeCampagineUserExist =
					await activeCampagineHelper.contectFetchByEmail(email)
				if (
					activeCampagineUserExist &&
					activeCampagineUserExist?.data?.contacts?.length
				) {
					const [activeCampagineUser] =
						activeCampagineUserExist.data.contacts
					activeCampagineUserId = activeCampagineUser.id
				} else {
					const {
						data: {
							contact: { id },
						},
					} = await activeCampagineHelper.createContact(
						activeCampagineData
					)
					activeCampagineUserId = id
				}

				await activeCampagineHelper.addContactToList(
					activeCampagineUserId
				)
			} catch (err) {
				logger.error('failling becaus of active campagine')
			}
			userId = user.id
		}

		const isCourseAlreadyPurchased = await courseService.userCoursesDetails(
			courseId,
			userId
		)
		try {
			const activeCampaignDealResp =
				await activeCampagineHelper.getDealByPhoneNo(
					user.phone_number,
					70
				)

			if (activeCampaignDealResp.data.deals[0] !== undefined) {
				activeCampaignDealId = activeCampaignDealResp.data.deals[0].id
				activeCampaignDealValue =
					activeCampaignDealResp.data.deals[0].value
				activeCampaignContactId =
					activeCampaignDealResp.data.deals[0].contact
			} else {
				const resp2 = await activeCampagineHelper.getDealByPhoneNo(
					user.email,
					70
				)
				if (resp2.data.deals[0] !== undefined) {
					activeCampaignDealId = resp2.data.deals[0].id
					activeCampaignDealValue = resp2.data.deals[0].value
					activeCampaignContactId = resp2.data.deals[0].contact
				}
			}
		} catch (error) {
			logger.error(`Admin panel error at active campaign ${error}`)
		}

		if (!isCourseAlreadyPurchased) {
			const courseHistoryList = []
			const courseDetails = await courseService.courseDetails(
				courseId,
				'id'
			)
			console.log(`creating purchase for ${userId}`)
			const ppOBJ = JSON.parse(courseDetails.partialpay_stripe_price_obj)
			let amount = 0
			let strPaymentDetails = ''
			let courseUserTransactionData = {}
			if (partialTime === 0) {
				courseUserTransactionData = {
					course_id: courseId,
					user_id: userId,
					stripe_id,
					status: 1,
					is_partial_payment: 0,
					user_ip: '',
					payment_details: `$${ppOBJ[partialTime].original_price}`,
					sales_agent,
				}
				const userCourse =
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
				courseHistoryList.push(userCourse)
				amount = ppOBJ[partialTime].original_price
				strPaymentDetails = `$${ppOBJ[partialTime].original_price}`
			} else if (partialTime === -1) {
				courseUserTransactionData = {
					course_id: courseId,
					user_id: userId,
					stripe_id: 'Manual_Add_By_Admin',
					status: 1,
					is_partial_payment: 0,
					user_ip: '',
					payment_details: `Free`,
					payment_devied_in: 0,
					sales_agent,
				}
				const userCourse =
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
				courseHistoryList.push(userCourse)
				amount = 0
				strPaymentDetails = `Free`
			} else {
				if (
					partialTime === 1 ||
					partialTime === 2 ||
					partialTime === 4 ||
					partialTime === 6 ||
					partialTime === 10 ||
					partialTime === 11 ||
					partialTime === 12 ||
					partialTime === 13
				) {
					amount = ppOBJ[partialTime].original_price
					strPaymentDetails = `${ppOBJ[partialTime].emis} X $${ppOBJ[partialTime].original_price}`
				} else {
					amount = ppOBJ[partialTime].emi[0].original_price
					strPaymentDetails = `$${
						ppOBJ[partialTime].emi[0].original_price
					} + (${ppOBJ[partialTime].emis - 1} X $${
						ppOBJ[partialTime].emi[1].original_price
					})`
					console.log('amountset2--->', amount)
				}
				courseUserTransactionData = {
					course_id: courseId,
					user_id: userId,
					stripe_id,
					status: 1,
					is_partial_payment: 1,
					next_payment_date: moment().add(30, 'days'),
					payment_devied_in: ppOBJ[partialTime].emis,
					remian_payments: ppOBJ[partialTime].emis - 1,
					each_payment_amount:
						partialTime === 1
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 2
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 4
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 6
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 10
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 11
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 12
							? ppOBJ[partialTime].price_with_tax
							: partialTime === 13
							? ppOBJ[partialTime].price_with_tax
							: ppOBJ[partialTime].emi[1].original_price,
					user_ip: '',
					next_payment_stripe_id:
						partialTime === 1
							? ppOBJ[partialTime].stripeid
							: partialTime === 2
							? ppOBJ[partialTime].stripeid
							: partialTime === 4
							? ppOBJ[partialTime].stripeid
							: partialTime === 6
							? ppOBJ[partialTime].stripeid
							: partialTime === 10
							? ppOBJ[partialTime].stripeid
							: partialTime === 11
							? ppOBJ[partialTime].stripeid
							: partialTime === 12
							? ppOBJ[partialTime].stripeid
							: partialTime === 13
							? ppOBJ[partialTime].stripeid
							: ppOBJ[partialTime].emi[1].stripeid,
					payment_details: strPaymentDetails,
					sales_agent,
				}
				const userCourse =
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
				courseHistoryList.push(userCourse)
			}
			if (partialTime !== -1) {
				const _amount =
					paid_amount === 0
						? ppOBJ[partialTime].original_price
						: paid_amount
				quickBookService.createInvoice(
					userId,
					courseId,
					_amount,
					currency_type
				)
			}

			const prepareCourseHistory = {
				course_id: courseId,
				user_id: userId,
				started_at: null,
				// purchased_amount: Number(amount / mctPriceAtPurchase).toFixed(2),
				total_reward_earned: 0,
				// mct_price_at_purchase: mctPriceAtPurchase,
				transaction_id: stripe_id,
			}
			await courseService.addCourseToUserData(prepareCourseHistory)
			try {
				if (parseInt(courseId) === 55) {
					await commonHelper.purchaseDineroDesbloqueadoMail(userId)
					const phno =
						user.phone_number.indexOf('+') === -1
							? '+' + user.phone_number
							: user.phone_number
					client.messages
						.create({
							body: `Hola ${user.name},
											Bienvenido a la mentoría de Dinero Desbloqueado. Para facilitar tu acceso al curso, también te hemos enviado un correo electrónico con instrucciones paso a paso a la dirección que utilizaste para realizar la compra. Este correo incluye tu nombre de usuario y contraseña, en caso de que aún no estés registrado en nuestra plataforma. Por favor, responde a este mensaje con un "Sí" si deseas instrucciones y soporte a través de WhatsApp.`,
							from: 'whatsapp:+14704659604',
							to: `whatsapp:${phno}`,
						})
						.then((message) => console.log(message.sid))
					if (activeCampaignDealId !== 0) {
						await activeCampagineHelper.updateActiveCampaignDeal(
							{
								deal: {
									stage: '842',
									currency: 'usd',
									value: amount,
									fields: [
										{
											customFieldId: 3,
											fieldValue: moment()
												.add(30, 'days')
												.format('DD-MMM-YYYY'),
										},
										{
											customFieldId: 4,
											fieldValue:
												courseUserTransactionData.payment_details,
										},
										{
											customFieldId: 5,
											fieldValue:
												courseUserTransactionData.remian_payments -
												1,
										},
									],
								},
							},
							activeCampaignDealId
						)

						await activeCampagineHelper.addTagsToContact(
							activeCampaignContactId,
							555
						)
					}
				}
				if (parseInt(courseId) === 56 && partialTime === 0) {
					const _amountNew =
						paid_amount === 0
							? ppOBJ[partialTime].original_price
							: paid_amount
					if (activeCampaignDealId !== 0) {
						await activeCampagineHelper.updateActiveCampaignDeal(
							{
								deal: {
									stage: '852',
									currency: 'usd',
									value: _amountNew * 100,
									status: 1,
								},
							},
							activeCampaignDealId
						)
					} else {
						await activeCampagineHelper.createActiveCampaignDeal({
							deal: {
								contact: activeCampagineUserId,
								description:
									'Deal created from mundocrypto.com',
								currency: 'usd',
								group: '70',
								owner: '1',
								percent: null,
								stage: '852',
								status: 1,
								title: user.name,
								value: _amountNew * 100,
							},
						})
					}
					await activeCampagineHelper.addContactToAutomation({
						contactAutomation: {
							contact: activeCampagineUserId,
							automation: '334',
						},
					})
				}
				const _amountNew =
					paid_amount === 0
						? ppOBJ[partialTime].original_price
						: paid_amount
				const _currency_type =
					currency_type === 'USD'
						? '$'
						: currency_type === 'EUR'
						? '€'
						: '$'
				const gReq = {
					course_name: courseDetails.name,
					name: user.name,
					email: user.email,
					phone: user.phone_number,
					payment_date: moment().format('DD-MMM-YYYY'),
					payment_amount: `${_currency_type}${_amountNew}`,
					payment_divided_in:
						courseUserTransactionData.payment_devied_in,
					payment_method: courseUserTransactionData.payment_details,
					merchant: 'Manual_Add_By_Admin',
					sales_agent,
				}
				await addDataToSheet.addPurchasedDataToGoogleSheet(gReq)
				await addDataToSheet.addPurchasedSalesAgentToGS(gReq)
			} catch (error) {
				logger.error(`admin panel error at google sheet ${error}`)
			}
			console.log('completed')
		}
		return response.helper(res, true, 'USER_ASSIGN_SUCCESS', {}, 200)
	} catch (err) {
		logger.error(`admin panel error ${err}`)
		next(err)
	}
}

const createCoinbasePaymentLink = async (req, res, next) => {
	try {
		const { name, description, price, currency } = req.body
		const amount = {
			currency,
			total: price,
		}
		const paymentData = { name, description, amount }
		console.log(paymentData)
		const coinbaseData = await coinbaseCommerceHelper.createCharge(
			paymentData
		)
		const resp = coinbaseData.hosted_url
		console.log(resp)
		return response.helper(
			res,
			true,
			'createCoinbasePaymentLink',
			{ resp },
			200
		)
	} catch (err) {
		next(err)
	}
}

const stripePayments = async (req, res, next) => {
	try {
		const data = await paymentService.stripePayments()

		return response.helper(res, true, 'stripePayments', { data }, 200)
	} catch (err) {
		next(err)
	}
}

const coinbasePayments = async (req, res, next) => {
	try {
		const data = await paymentService.coinbasePayments()
		const finalData = []
		data.forEach((eachData) => {
			let iAmount = ''
			try {
				iAmount =
					eachData.amount.pricing.local.amount +
					' ' +
					eachData.amount.pricing.local.currency
			} catch (error) {
				iAmount = '0'
			}
			if (eachData.coinbase_id !== '0') {
				finalData.push({
					coinbase_id: eachData.coinbase_id,
					courseName: eachData.courseName,
					user_id: eachData.user_id,
					amount: iAmount,
					payment_date: moment(eachData.created_at).format(
						'DD/MMM/YYYY'
					),
					user_ip: eachData.user_ip,
					created_at: eachData.created_at,
					email: eachData.email,
					userName: eachData.userName,
					phone_number: eachData.phone_number,
					address_line_1: eachData.addressData?.address_line_1,
					address_line_2: eachData.addressData?.address_line_2,
					state: eachData.addressData?.state,
					country: eachData.addressData?.country,
					zip_code: eachData.addressData?.zip_code,
				})
			}
		})
		const list = await db.sequelize.query(
			`select transaction_id as coinbase_id,c.name as courseName,pi.user_id,pi.amount,DATE_FORMAT(pi.created_at, "%d/%M/%Y") as payment_date,
			'' as user_ip, DATE_FORMAT(pi.created_at, "%d/%M/%Y") as created_at,
			u.email,u.name as userName,u.phone_number,u.address_line1 as address_line_1,u.address_line2 as address_line_2,
			u.state,u.country, '' as zip_code
			from payment_installments pi
			join courses c on c.id = pi.course_id
			join users u on u.id = pi.user_id
			where payment_with = 'coinbase' and status <> 'failed'
			and transaction_id not in (select coinbase_id from courses_users where coinbase_id is not null and status =1 and coinbase_id <> 0);`
		)

		list[0].map((l) => {
			finalData.push(l)
		})
		return response.helper(res, true, 'coinbasePayments', finalData, 200)
	} catch (err) {
		next(err)
	}
}

const mctPayments = async (req, res, next) => {
	try {
		const data = await paymentService.mctPayments()
		return response.helper(res, true, 'mctPayments', { data }, 200)
	} catch (err) {
		next(err)
	}
}

const updateVatPercentage = async (req, res, next) => {
	try {
		const { id, percentage } = req.body
		const data = await adminService.updateVatRate(id, { percentage })
		return response.helper(res, true, 'vat_rates', { data }, 200)
	} catch (err) {
		next(err)
	}
}

const getAllVatRates = async (req, res, next) => {
	try {
		const data = await adminService.getVatRates()
		return response.helper(res, true, 'vat_rates', data, 200)
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

const getSubModulesByModuleId = async (req, res, next) => {
	const { module_id } = req.params
	const list = await courseService.getAllSubModules(module_id)
	return response.helper(res, true, 'SUB_MODULES', list, 200)
}

const getReferralCodesByCourseId = async (req, res, next) => {
	const { course_id } = req.params
	const list = await adminService.getReferralCodesByCourseId(course_id)
	return response.helper(res, true, 'REFERRAL_CODES', list, 200)
}
const addNewReferralCode = async (req, res, next) => {
	const data = req.body

	const list = await adminService.addReferealCode(data)
	return response.helper(res, true, 'REFERRAL_CODES', list, 200)
}
const deactivateCouponCode = async (req, res, next) => {
	const { id } = req.body

	const list = await adminService.deactivateCouponCode(id)
	return response.helper(res, true, 'REFERRAL_CODES', list, 200)
}

const getSalesAgentsCount = async (req, res, next) => {
	const { course_id } = req.params
	const list = await adminService.getSalesAgentsCount(course_id)
	return response.helper(res, true, 'SALES_AGENTS_COUNT', list, 200)
}

const addUpdateSalesAgentsCount = async (req, res, next) => {
	const { course_id, no_agents } = req.body

	const list = await adminService.addUpdateSalesAgentsCount(
		course_id,
		no_agents
	)
	return response.helper(res, true, 'SALES_AGENTS_COUNT', list, 200)
}

const updateUserCoursePaymentInfo = async (req, res, next) => {
	const { remian_payments, next_payment_date, id } = req.body

	const list = await courseService.userCourseUpdate(id, {
		remian_payments,
		next_payment_date,
	})
	return response.helper(res, true, 'UPDATE_PAYMENT_INFO', list, 200)
}

const get = async (req, res, next) => {
	//const { courseId } = req.params
	const list = await db.sequelize.query(
		`select u.name as n,u.email as e,u.phone_number as p,u.created_at as uco,u.address_line1 as a1,u.address_line2 as a2,
		u.state as s,u.country as c ,
		(select count(*) from courses_users cu where cu.status = 1 and cu.user_id = u.id) as cn
		from users u;`
	)
	return response.helper(res, true, 'USERS', list[0], 200)
}

module.exports = {
	removeCourseAccess,
	addWalletTokens,
	removeWalletTokens,
	removeDocument,
	courseDetails,
	listAllCourse,
	updateModuleLecture,
	updateCourseModule,
	mctPaymentSummary,
	coinbasePaymentSummary,
	stripePaymentSummary,
	userList,
	assignCourseToUser,
	getUserAssignedCourseList,
	assignCourseToMintNft,
	userDetails,
	userListByCourse,
	userExamDetailsByCourse,
	pendingPaymentList,
	addUserAndAssignCourse,
	getUsersAssignedToCourse,
	removeCourseAccessWithRefund,
	createCoinbasePaymentLink,
	stripePayments,
	coinbasePayments,
	mctPayments,
	getCourseLectures,
	removeLecture,
	removeModule,
	updateLectureSubModule,
	getSubModulesByModuleId,
	hotMartController,
	updateVatPercentage,
	getAllVatRates,
	getReferralCodesByCourseId,
	addNewReferralCode,
	deactivateCouponCode,
	getSalesAgentsCount,
	addUpdateSalesAgentsCount,
	updateUserCoursePaymentInfo,
}
