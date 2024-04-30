const { Client, Webhook, resources } = require('coinbase-commerce-node')
const { Charge } = resources
const config = require('../config/config')

const logger = require('../config/logger')
const courseService = require('../dbService/course.services')
const activeCampagineHelper = require('../helpers/activecampaign')
const userService = require('../dbService/user.service')
const commonHelper = require('../helpers/common.helper')
const commonService = require('../dbService/common.service')
const moment = require('moment')

Client.init(config.COINBASE_SECRET)

module.exports.createCharge = async (paymentData) => {
	try {
		const chargeData = {
			name: paymentData.description,
			description: paymentData.description,
			local_price: {
				amount: paymentData.amount.total,
				currency: paymentData.amount.currency,
			},
			pricing_type: 'fixed_price',
			metadata: paymentData,
		}
		const charge = await Charge.create(chargeData)
		return charge
	} catch (error) {
		return error
	}
}

const getChargeData = async (chargeId) => {
	try {
		const data = await Charge.retrieve(chargeId)
		return data
	} catch (err) {
		return err
	}
}

module.exports.getChargeData = getChargeData

module.exports.coinbaseWebhookController = async (req, res, next) => {
	let event
	try {
		event = Webhook.verifyEventBody(
			JSON.stringify(req.body),
			// req.body,
			req.headers['x-cc-webhook-signature'],
			config.COINBASE_WEBHOOK
		)

		logger.coinaseWebhook(
			'Coinbase webhook call start ---------------------------'
		)
		const paymentId = req.body.event.data.code
		logger.coinaseWebhook(`Coinbase payment code ${paymentId}`)

		const paypalData = req.body.event
		let totalAmount = 0
		let userId
		const tokenAv = await commonService.calculateTokenAvg()
		const responseData = commonHelper.avgPriceOfMCT(tokenAv)
		const mctAmount = responseData.price
		let discountId
		if (paypalData && paypalData?.type === 'charge:confirmed') {
			logger.coinaseWebhook(`in charge confirm`)

			payment_with = 'coinbase'
			let [cartCourse] =
				await courseService.getCourseListCoinbaseCommerce(paymentId)
			let isCourseWithPack = false
			let isCourseWithDiscount = false
			let cartPackId

			if (cartCourse?.dataValues?.package_id) {
				logger.coinaseWebhook(`webhook for package purchase`)

				cartCourse = cartCourse.dataValues
				isCourseWithPack = true
				const packageCourseList = await courseService.packageDetails(
					cartCourse.package_id
				)
				const coursesList = packageCourseList.course_ids
					? packageCourseList.course_ids.split(',')
					: []
				const newCourseArr = []
				cartPackId = cartCourse.id
				coursesList.forEach((eachCourse) => {
					const temp = {
						user_id: cartCourse.user_id,
						course_id: eachCourse,
						id: cartCourse.id,
					}
					newCourseArr.push(temp)
				})
				userId = cartCourse.user_id
				discountId = cartCourse.used_discount_id

				cartCourse = newCourseArr
			} else if (cartCourse?.dataValues?.discount_id) {
				logger.coinaseWebhook(`webhook for package purchase`)

				cartCourse = cartCourse.dataValues
				isCourseWithDiscount = true
				cartPackId = cartCourse.id
				const discountDetails = await courseService.discountDetails(
					cartCourse.discount_id
				)
				totalAmount = discountDetails.discount_amount
				userId = cartCourse.user_id
			} else {
				logger.coinaseWebhook(`webhook for course purchase`)

				cartCourse = await courseService.getCourseListCoinbaseCommerce(
					paymentId
				)
			}
			for (let i = 0; i < cartCourse.length; i++) {
				userId = cartCourse[i].user_id
				if (!discountId) {
					discountId = cartCourse[i].used_discount_id
				}

				const courseId = cartCourse[i].course_id
				const isCourseWithSameName = await courseService.courseDetails(
					courseId,
					'id'
				)
				if (!isCourseWithSameName) {
					continue
				}
				const isCourseAlreadyPurchased =
					await courseService.userCoursesDetails(courseId, userId)
				if (isCourseAlreadyPurchased) {
					continue
				}

				if (isCourseWithPack) {
					const check = await courseService.userCourseData(
						courseId,
						userId
					)
					if (check) {
						continue
					}
				}
				totalAmount += isCourseWithSameName.price
				if (!isCourseWithPack) {
					await courseService.userCourseUpdate(cartCourse[i].id, {
						status: 1,
					})
				}
				const prepareCourseHistory = {
					course_id: courseId,
					user_id: cartCourse[i].user_id,
					started_at: moment().format('YYYY-MM-DD'),
					purchased_amount: Number(
						isCourseWithSameName.price / mctAmount
					).toFixed(2), // storing in mct
					reward_amount:
						isCourseWithSameName.price +
						(isCourseWithSameName.price * 20) / 100,
					total_reward_earned: 0,
					mct_price_at_purchase: mctAmount,
					transaction_id: paymentId,
				}
				logger.coinaseWebhook(
					`Course Added To my learning ${courseId} ${cartCourse[i].user_id}`
				)
				await courseService.addCourseToUserData(prepareCourseHistory)
				await courseService.removeToCart(
					courseId,
					cartCourse[i].user_id
				)
			}
			if (totalAmount) {
				const isTransactionExist =
					await courseService.isTransactionExist(paymentId)
				if (!isTransactionExist) {
					const transactionObj = {
						user_id: userId,
						transaction_id: paymentId,
						amount: totalAmount,
						payment_with,
						used_discount_id: discountId,
					}
					logger.coinaseWebhook(
						`Transaction Obj ${JSON.stringify(transactionObj)}`
					)
					await courseService.addUserTransaction(transactionObj)
				}
				if (discountId) {
					logger.coinaseWebhook(`Discount Used ${discountId}`)
					await courseService.updateDiscountIdMarktAsUsed(
						discountId,
						userId
					)
				}
				if (isCourseWithPack) {
					logger.coinaseWebhook(`Package Purchased ${cartPackId}`)
					await courseService.userCourseUpdate(cartPackId, {
						status: 1,
					})
					await commonHelper.purchaseMail(userId)
				}
				if (isCourseWithDiscount) {
					logger.coinaseWebhook(`Discount Purchased ${cartPackId}`)
					await courseService.userCourseUpdate(cartPackId, {
						status: 1,
					})
					const userData = await userService.userDetails(userId)
					if (userData.dataValues.active_campagin_id) {
						await activeCampagineHelper.addTagsToContact(
							userData.dataValues.active_campagin_id,
							config.BOOKING_SEAT_TAG
						)
					}

					// await commonHelper.purchaseMail(userId);
				}
			}
		}
		logger.coinaseWebhook('Coinbase webhook completed with success')
		return res.send({
			msg: 'success',
		})
	} catch (error) {
		logger.coinaseWebhook(`Coinbase webhook completed with error ${error}`)
		return res.send({
			msg: 'error',
			err: error,
		})
	}
}
