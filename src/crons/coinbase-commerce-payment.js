const cron = require('node-cron')
const { Op } = require('sequelize')
const dbObj = require('../../models/index')
const logger = require('../config/logger.js')
const config = require('../config/config')
const coinmarketcapHelper = require('../helpers/coinbase.helper')
const activeCampagineHelper = require('../helpers/activecampaign')
const userService = require('../dbService/user.service')
const commonHelper = require('../helpers/common.helper')
const commonService = require('../dbService/common.service')
const moment = require('moment')
const courseService = require('../dbService/course.services')

const env = config.NODE_ENV || 'development'

const accountSid = 'AC6d9cd24c093a42df79c8c9911e490edb'
const authToken = '62b83d76f6b8fba0f843975182d500f5'
const client = require('twilio')(accountSid, authToken)
const quickBookService = require('../dbService/quickbook.service')
const addDataToSheet = require('../helpers/addDataToSheet.helper')

cron.schedule('* * * * *', async () => {
	logger.cron('Coinbase commerce cron start')
	try {
		const courseUsersModel = dbObj.courses_users
		const coinmarketCapData = await courseUsersModel.findAll({
			where: {
				status: 0,
				coinbase_id: {
					[Op.not]: null,
				},
				is_partial_payment: 0,
			},
			attributes: [
				'id',
				'course_id',
				'package_id',
				'discount_id',
				'user_id',
				'coinbase_id',
				'stripe_id',
				'transaction_id',
				'status',
				'address_id',
				'is_discount_used',
				'used_discount_id',
			],
		})
		const promiseList = []
		const coinbasePaymentData = []
		coinmarketCapData.forEach((eachcoinmarketCapPayment) => {
			const coinmarketData = eachcoinmarketCapPayment.dataValues
			const promise = new Promise(async (resolve, reject) => {
				const data = await coinmarketcapHelper.getChargeData(
					coinmarketData.coinbase_id
				)
				coinbasePaymentData.push({
					data,
					id: coinmarketData.id,
					code: coinmarketData.coinbase_id,
				})
				resolve(data)
			})
			promiseList.push(promise)
		})
		await Promise.all(promiseList)
		for (let i = 0; i < coinbasePaymentData.length; i++) {
			const eachCoinbasePayment = coinbasePaymentData[i].data
			const code = coinbasePaymentData[i].code
			const id = coinbasePaymentData[i].id
			logger.coinaseWebhook(`Code to check ${code}`)
			const { payments, timeline } = eachCoinbasePayment
			let isPaymentConfirm = false
			timeline?.forEach((eachTimeline) => {
				if (eachTimeline.status === 'COMPLETED') {
					isPaymentConfirm = true
				}
			})
			if (
				payments &&
				payments.length &&
				payments[0].status == 'CONFIRMED' &&
				isPaymentConfirm
			) {
				console.log('payments', payments)
				const paymentData = {
					body: {
						event: {
							data: {
								code: eachCoinbasePayment.code,
							},
							type: 'charge:confirmed',
						},
					},
				}
				logger.coinbaseCommerceChangeLog(
					`Code ${eachCoinbasePayment.code} change to payment success course_user id is ${id}`
				)
				await coinbaseCommerceWebhookLogic(paymentData)
			} else {
				const paymentTimeline = eachCoinbasePayment.timeline
				let isCodeExpired = false
				if (paymentTimeline) {
					paymentTimeline.forEach((eachTime) => {
						if (eachTime.status === 'EXPIRED') {
							isCodeExpired = true
						}
					})
				} else {
					isCodeExpired = true
				}
				if (isCodeExpired) {
					logger.coinbaseCommerceChangeLog(
						`Code ${code} change to payment fail course_user id is ${id}`
					)
					await courseService.userCourseUpdate(id, { status: 2 })
				}
			}
		}
		logger.cron('Coinbase commerce cron end')
	} catch (err) {
		console.log('err', err)
		logger.cron(`Coinbase commerce cron error ${err}`)
	}
})

const coinbaseCommerceWebhookLogic = async (req) => {
	try {
		const paymentId = req.body.event.data.code
		logger.coinbaseCommerceChangeLog(`Coinbase payment code ${paymentId}`)
		const paypalData = req.body.event
		let totalAmount = 0
		let userId
		const tokenAv = await commonService.calculateTokenAvg()
		const responseData = commonHelper.avgPriceOfMCT(tokenAv)
		const mctAmount = responseData.price
		let discountId

		let activeCampaignDealId = 0
		let activeCampaignDealValue = 0
		let activeCampaignContactId = 0
		if (paypalData && paypalData?.type === 'charge:confirmed') {
			logger.coinbaseCommerceChangeLog(`in charge confirm`)

			payment_with = 'coinbase'
			let [cartCourse] =
				await courseService.getCourseListCoinbaseCommerce(paymentId)
			let isCourseWithPack = false
			let isCourseWithDiscount = false
			let cartPackId
			let packageCourseList
			if (cartCourse?.dataValues?.package_id) {
				logger.coinbaseCommerceChangeLog(`package purchase`)

				cartCourse = cartCourse.dataValues
				isCourseWithPack = true
				packageCourseList = await courseService.packageDetails(
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
				logger.coinbaseCommerceChangeLog(`discount purchase`)

				cartCourse = cartCourse.dataValues
				isCourseWithDiscount = true
				cartPackId = cartCourse.id
				const discountDetails = await courseService.discountDetails(
					cartCourse.discount_id
				)
				totalAmount = discountDetails.discount_amount
				userId = cartCourse.user_id
			} else {
				logger.coinbaseCommerceChangeLog(`course purchase`)

				cartCourse = await courseService.getCourseListCoinbaseCommerce(
					paymentId
				)
			}
			for (let i = 0; i < cartCourse.length; i++) {
				userId = cartCourse[i].user_id
				const userData = await userService.userDetails(userId)

				if (!discountId) {
					discountId = cartCourse[i].used_discount_id
				}

				const courseId = cartCourse[i].course_id
				quickBookService.createInvoice(
					userId,
					courseId,
					cartCourse[i].purchase_amount_usd
				)
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
					await activeCampagineHelper.addTagsToContact(
						userData.dataValues.active_campagin_id,
						isCourseWithSameName.active_campagine_tag
					)
				}

				let purchaseAmount = Number(
					isCourseWithSameName.price / mctAmount
				).toFixed(2)
				let rewardAmount =
					isCourseWithSameName.price +
					(isCourseWithSameName.price * 20) / 100
				if (isCourseWithPack) {
					purchaseAmount =
						Number(packageCourseList.price / mctAmount).toFixed(2) /
						7
					rewardAmount = purchaseAmount + (purchaseAmount * 20) / 100
					logger.coinaseWebhook(
						`is with pack ${purchaseAmount} , ${rewardAmount}`
					)
				}
				const prepareCourseHistory = {
					course_id: courseId,
					user_id: cartCourse[i].user_id,
					started_at: null,
					purchased_amount: purchaseAmount, // storing in mct
					reward_amount: rewardAmount,
					total_reward_earned: 0,
					mct_price_at_purchase: mctAmount,
					transaction_id: paymentId,
				}
				logger.coinbaseCommerceChangeLog(
					`Course Added To my learning ${courseId} ${cartCourse[i].user_id}`
				)
				await courseService.addCourseToUserData(prepareCourseHistory)
				await courseService.removeToCart(
					courseId,
					cartCourse[i].user_id
				)

				if (parseInt(courseId) === 55) {
					await commonHelper.purchaseDineroDesbloqueadoMail(
						cartCourse[i].user_id
					)
					const phno =
						userData.dataValues.phone_number.indexOf('+') === -1
							? '+' + userData.dataValues.phone_number
							: userData.dataValues.phone_number
					client.messages
						.create({
							body: `Hola ${userData.dataValues.name},
											Bienvenido a la mentoría de Dinero Desbloqueado. Para facilitar tu acceso al curso, también te hemos enviado un correo electrónico con instrucciones paso a paso a la dirección que utilizaste para realizar la compra. Este correo incluye tu nombre de usuario y contraseña, en caso de que aún no estés registrado en nuestra plataforma. Por favor, responde a este mensaje con un "Sí" si deseas instrucciones y soporte a través de WhatsApp.`,
							from: 'whatsapp:+14704659604',
							to: `whatsapp:${phno}`,
						})
						.then((message) => console.log(message.sid))

					try {
						const activeCampaignDealResp =
							await activeCampagineHelper.getDealByPhoneNo(
								userData.dataValues.phone_number
							)

						if (
							activeCampaignDealResp.data.deals[0] !== undefined
						) {
							activeCampaignDealId =
								activeCampaignDealResp.data.deals[0].id
							activeCampaignDealValue =
								activeCampaignDealResp.data.deals[0].value
							activeCampaignContactId =
								activeCampaignDealResp.data.deals[0].contact
						} else {
							const resp2 =
								await activeCampagineHelper.getDealByPhoneNo(
									userData.dataValues.email
								)
							if (resp2.data.deals[0] !== undefined) {
								activeCampaignDealId = resp2.data.deals[0].id
								activeCampaignDealValue =
									resp2.data.deals[0].value
								activeCampaignContactId =
									resp2.data.deals[0].contact
							}
						}
					} catch (error) {
						logger.coinaseWebhook(
							`Coinbase  error at active campaign ${error}`
						)
					}
					if (activeCampaignDealId !== 0) {
						const newDealValue = parseInt(
							isCourseWithSameName.price
						)
						await activeCampagineHelper.updateActiveCampaignDeal(
							{
								deal: {
									stage: '841',
									currency: 'usd',
									value: newDealValue,
									status: 1,
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
				if (parseInt(courseId) === 56) {
					try {
						const activeCampaignDealResp =
							await activeCampagineHelper.getDealByPhoneNo(
								userData.dataValues.phone_number,
								70
							)

						if (
							activeCampaignDealResp.data.deals[0] !== undefined
						) {
							activeCampaignDealId =
								activeCampaignDealResp.data.deals[0].id
							activeCampaignDealValue =
								activeCampaignDealResp.data.deals[0].value
							activeCampaignContactId =
								activeCampaignDealResp.data.deals[0].contact
						} else {
							const resp2 =
								await activeCampagineHelper.getDealByPhoneNo(
									userData.dataValues.email,
									70
								)
							if (resp2.data.deals[0] !== undefined) {
								activeCampaignDealId = resp2.data.deals[0].id
								activeCampaignDealValue =
									resp2.data.deals[0].value
								activeCampaignContactId =
									resp2.data.deals[0].contact
							}
						}
						const newDealValue = parseInt(
							isCourseWithSameName.price
						)
						if (activeCampaignDealId !== 0) {
							await activeCampagineHelper.updateActiveCampaignDeal(
								{
									deal: {
										stage: '852',
										currency: 'usd',
										value: newDealValue,
										status: 1,
									},
								},
								activeCampaignDealId
							)
						} else {
							await activeCampagineHelper.createActiveCampaignDeal(
								{
									deal: {
										contact: activeCampaignContactId,
										description:
											'Deal created from mundocrypto.com',
										currency: 'usd',
										group: '70',
										owner: '1',
										percent: null,
										stage: '852',
										status: 1,
										title: userData.dataValues.name,
										value: newDealValue,
									},
								}
							)
						}
					} catch (error) {
						logger.stripeWehbook(
							`Coinbase error at active campaign ${error}`
						)
					}
				}
				try {
					const gReq = {
						course_name: isCourseWithSameName.name,
						name: userData.dataValues.name,
						email: userData.dataValues.email,
						phone: userData.dataValues.phone_number,
						payment_date: moment().format('DD-MMM-YYYY'),
						payment_amount: `$${cartCourse[i].purchase_amount_usd}`,
						payment_divided_in: 0,
						payment_method: cartCourse[i].payment_details,
						merchant: 'Coinbase',
						sales_agent: cartCourse[i].sales_agent,
					}
					await addDataToSheet.addPurchasedDataToGoogleSheet(gReq)
					await addDataToSheet.addPurchasedSalesAgentToGS(gReq)
				} catch (error) {
					logger.coinaseWebhook(
						`Coinbase  error at google sheet ${error}`
					)
				}
			}
			if (totalAmount) {
				const userData = await userService.userDetails(userId)
				if (isCourseWithPack) {
					totalAmount = packageCourseList.price
					if (discountId) {
						const discountData = await courseService.packageDetails(
							discountId,
							0
						)
						totalAmount -= discountData.price
					}
				}
				const isTransactionExist =
					await courseService.isTransactionExist(paymentId)
				const walletData = await userService.walletData(userId)
				if (cartCourse[0]?.mc_amount) {
					await userService.deductMctFromWallet(userId, {
						token_balance:
							walletData.token_balance - cartCourse[0]?.mc_amount,
					})
					await userService.addWalletHistory({
						user_id: userId,
						amount: cartCourse[0].mc_amount,
						transaction_type: 'debit',
					})
				}
				if (!isTransactionExist) {
					const transactionObj = {
						user_id: userId,
						transaction_id: paymentId,
						amount: totalAmount,
						payment_with,
						used_discount_id: discountId,
					}
					logger.coinbaseCommerceChangeLog(
						`Transaction Obj ${JSON.stringify(transactionObj)}`
					)
					await courseService.addUserTransaction(transactionObj)
				}
				if (discountId) {
					logger.coinbaseCommerceChangeLog(
						`Discount Used ${discountId}`
					)
					await courseService.updateDiscountIdMarktAsUsed(
						discountId,
						userId
					)
				}
				if (isCourseWithPack) {
					logger.coinbaseCommerceChangeLog(
						`Package Purchased ${cartPackId}`
					)
					await courseService.userCourseUpdate(cartPackId, {
						status: 1,
					})
					await commonHelper.purchaseMail(userId)

					if (userData.dataValues.active_campagin_id) {
						await activeCampagineHelper.addTagsToContact(
							userData.dataValues.active_campagin_id,
							config.PACKAGE_ID
						)
					}
				}
				if (isCourseWithDiscount) {
					logger.coinbaseCommerceChangeLog(
						`Discount Purchased ${cartPackId}`
					)
					await courseService.userCourseUpdate(cartPackId, {
						status: 1,
					})
					if (userData.dataValues.active_campagin_id) {
						await activeCampagineHelper.addTagsToContact(
							userData.dataValues.active_campagin_id,
							config.BOOKING_SEAT_TAG
						)
					}

					// await commonHelper.purchaseMail(userId);
				} else {
					await activeCampagineHelper.addContactToList(
						userData.dataValues.active_campagin_id,
						config.PACKAGE_LIST
					)
				}
			}
		}
		logger.coinbaseCommerceChangeLog(
			'Coinbase iteration completed with success'
		)
	} catch (error) {
		logger.coinbaseCommerceChangeLog(
			`Coinbase iteration completed with error ${error}`
		)
	}
}
