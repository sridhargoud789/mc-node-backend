const config = require('../config/config')
const logger = require('../config/logger')
const dbObj = require('../../models/index')
const courseService = require('../dbService/course.services')
const Webhook = require('coinbase-commerce-node').Webhook
const coinbaseCommerceHelper = require('../helpers/coinbase.helper')
const activeCampagineHelper = require('../helpers/activecampaign')
const userService = require('../dbService/user.service')
const commonHelper = require('../helpers/common.helper')
const commonService = require('../dbService/common.service')
const paymentService = require('../dbService/payment.service')
const moment = require('moment')
const { response } = require('express')
const paymentInstallmentsModel = dbObj.payment_installments
const courseUserModel = dbObj.courses_users
const nftPurchaseModel = dbObj.nft_purchases

const env = config.NODE_ENV || 'development'

const accountSid = 'AC6d9cd24c093a42df79c8c9911e490edb'
const authToken = '62b83d76f6b8fba0f843975182d500f5'
const client = require('twilio')(accountSid, authToken)

const addDataToSheet = require('../helpers/addDataToSheet.helper')

const quickBookService = require('../dbService/quickbook.service')
module.exports.paypalWebhookController = async (req, res, next) => {
	try {
		const paymentId = req.body.id
		const paypalData = req.body
		let totalAmount = 0
		let userId

		if (paypalData && paypalData?.payer?.status === 'VERIFIED') {
			logger.info('paypal webhook called with verified status')
			payment_with = 'paypal'
			const cartCourse = await courseService.getCourseListPayedByPaypal({
				paypal_id: paymentId,
			})
			let isCourseWithPack = false
			let cartPackId
			if (cartCourse[0]?.package_id) {
				cartCourse = cartCourse[0]
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
				cartCourse = newCourseArr
			}

			for (let i = 0; i < cartCourse.length; i++) {
				userId = cartCourse[i].user_id

				const courseId = cartCourse[i].course_id
				const isCourseWithSameName = await courseService.courseDetails(
					courseId,
					'id'
				)
				if (!isCourseWithSameName) {
					continue
				}
				const isCourseAlreadyPurchased =
					await courseService.getCourseListPayedByPaypal({
						course_id: courseId,
						paypal_id: paymentId,
						status: 1,
					})
				if (isCourseAlreadyPurchased) {
					continue
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
					transaction_id: paymentId,
				}
				await courseService.addCourseToUserData(prepareCourseHistory)
				await courseService.removeToCart(
					courseId,
					cartCourse[i].user_id
				)
			}
			if (totalAmount) {
				await courseService.addUserTransaction({
					user_id: userId,
					transaction_id: paymentId,
					amount: totalAmount,
					payment_with,
				})
				if (isCourseWithPack) {
					await courseService.userCourseUpdate(cartPackId, {
						status: 1,
					})
				}
			}
		}
	} catch (err) {
		next(err)
	}
}

module.exports.coinbaseWebhookController = async (req, res, next) => {
	let event
	try {
		// event = Webhook.verifyEventBody(
		//     req.body,
		//     req.headers['x-cc-webhook-signature'],
		//     config.COINBASE_WEBHOOK,
		// );

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
				const userData = await userService.userDetails(userId)

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
				quickBookService.createInvoice(
					userData.id,
					isCourseAlreadyPurchased.id,
					paidPrice
				)
				if (parseInt(courseId) === 55) {
					await commonHelper.purchaseDineroDesbloqueadoMail(userId)
					const phno =
						userData.phone_number.indexOf('+') === -1
							? '+' + userData.phone_number
							: userData.phone_number
					client.messages
						.create({
							body: `Hola ${userData.name},
									Bienvenido a la mentoría de Dinero Desbloqueado. Para facilitar tu acceso al curso, también te hemos enviado un correo electrónico con instrucciones paso a paso a la dirección que utilizaste para realizar la compra. Este correo incluye tu nombre de usuario y contraseña, en caso de que aún no estés registrado en nuestra plataforma. Por favor, responde a este mensaje con un "Sí" si deseas instrucciones y soporte a través de WhatsApp.`,
							from: 'whatsapp:+14704659604',
							to: `whatsapp:${phno}`,
						})
						.then((message) => console.log(message.sid))
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
				if (parseInt(courseId) === 55) {
					await commonHelper.purchaseDineroDesbloqueadoMail(userId)
					const phno =
						userData.phone_number.indexOf('+') === -1
							? '+' + userData.phone_number
							: userData.phone_number
					client.messages
						.create({
							body: `Hola ${userData.name},
									Bienvenido a la mentoría de Dinero Desbloqueado. Para facilitar tu acceso al curso, también te hemos enviado un correo electrónico con instrucciones paso a paso a la dirección que utilizaste para realizar la compra. Este correo incluye tu nombre de usuario y contraseña, en caso de que aún no estés registrado en nuestra plataforma. Por favor, responde a este mensaje con un "Sí" si deseas instrucciones y soporte a través de WhatsApp.`,
							from: 'whatsapp:+14704659604',
							to: `whatsapp:${phno}`,
						})
						.then((message) => console.log(message.sid))
				}
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

module.exports.stripeWebhookController = async (req, res, next) => {
	try {
		const {
			data: { object },
			type,
		} = req.body
		const paidPrice = object.amount / 100
		logger.stripeWehbook(
			`Stripe webhook call start ---------------------------`
		)

		let strNext_Payment_Date = ''
		let strRemaining_Payments = ''
		let strPayment_Details = ''
		let activeCampaignDealId = 0
		let activeCampaignDealValue = 0
		let activeCampaignContactId = 0
		const tokenAv = await commonService.calculateTokenAvg()
		const responseData = commonHelper.avgPriceOfMCT(tokenAv)
		const mctAmount = responseData.price
		const paymentId = object.payment_intent
		logger.stripeWehbook(`Stripe payment id ${paymentId}`)

		const stripeData = req.body
		let discountId
		let totalAmount = 0
		let userId
		if (object && type == 'charge.succeeded') {
			logger.stripeWehbook(`in charge confirm`)
			payment_with = 'stripe'

			const stripeNftPurchase = await nftPurchaseModel.findOne({
				where: {
					status: 0,
					purchase_with: 'stripe',
					transaction_id: paymentId,
				},
				attributes: [
					'id',
					'course_id',
					'user_id',
					'transaction_id',
					'status',
					'amount',
					'mct_price_at_purchase',
				],
				logging: console.log,
			})

			if (stripeNftPurchase) {
				await nftMintLogic(paymentId)
			} else {
				const paymentWithPartialPay =
					await paymentInstallmentsModel.findOne({
						where: {
							status: 'pending',
							payment_with: 'stripe',
							transaction_id: paymentId,
						},
						attributes: [
							'id',
							'course_id',
							'user_id',
							'transaction_id',
							'status',
							'amount',
							'mct_amount_on_purchase',
						],
						logging: console.log,
					})

				if (paymentWithPartialPay) {
					let cartCourse = await paymentInstallmentsModel.findOne({
						where: {
							transaction_id: paymentId,
						},
						attributes: [
							'id',
							'course_id',
							'user_id',
							'transaction_id',
							'status',
							'amount',
							'mct_amount_on_purchase',
							'is_full_pay',
						],
					})

					userId = cartCourse.user_id
					const userData = await userService.userDetails(userId)
					const courseId = cartCourse.course_id
					quickBookService.createInvoice(userId, courseId, paidPrice)
					const courseData = await courseService.courseDetails(
						courseId,
						'id'
					)
					const userCourseData = await courseUserModel.findOne({
						where: {
							course_id: courseId,
							user_id: userId,
							is_partial_payment: 1,
							stripe_id: cartCourse.transaction_id,
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
						const activeCampaignDealResp =
							await activeCampagineHelper.getDealByPhoneNo(
								userData.phone_number
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
									userData.email
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
						logger.stripeWehbook(
							`Stripe  error at active campaign ${error}`
						)
					}
					if (
						userCourseData.payment_devied_in !=
						userCourseData.remian_payments
					) {
						console.log('stripe step 1')
						let purchaseData = userCourseData
						if (purchaseData.remian_payments == 1) {
							console.log('stripe step 2')
							await paymentService.updatePayment(cartCourse.id, {
								status: 'success',
							})
							const savePaymentInstallmentList =
								await paymentService.paymentInstallments(
									courseId,
									userId
								)
							let totalMct = mctAmount
							savePaymentInstallmentList.forEach(
								(eachPayment) => {
									totalMct +=
										eachPayment.mct_amount_on_purchase
								}
							)
							const finalMCTPrice =
								totalMct / purchaseData.payment_devied_in
							const purchaseAmount =
								(cartCourse.amount *
									purchaseData.payment_devied_in) /
								finalMCTPrice
							const updateCourseHistoryData = {
								mct_price_at_purchase: finalMCTPrice,
								purchased_amount: purchaseAmount,
								reward_amount:
									purchaseAmount + purchaseAmount * 0.2,
							}
							const userCourseHistory =
								await courseService.userCourseData(
									courseId,
									userId
								)
							await courseService.updateUserCourseData(
								userCourseHistory.id,
								updateCourseHistoryData
							)

							await courseService.userCourseUpdate(
								purchaseData.id,
								{
									remian_payments: 0,
									next_payment_date: null,
								}
							)
							await courseService.addUserTransaction({
								user_id: userId,
								transaction_id: paymentId,
								amount: cartCourse.amount,
								payment_with: 'stripe',
							})

							if (
								activeCampaignDealId !== 0 &&
								parseInt(courseId) === 55
							) {
								const newDealValue =
									parseInt(activeCampaignDealValue) +
									parseInt(object.amount)
								await activeCampagineHelper.updateActiveCampaignDeal(
									{
										deal: {
											stage: '841',
											currency: 'usd',
											value: newDealValue,
											status: 1,
											fields: [
												{
													customFieldId: 3,
													fieldValue: '',
												},
												{
													customFieldId: 5,
													fieldValue: '0',
												},
											],
										},
									},
									activeCampaignDealId
								)
							}

							try {
								const gReq = {
									course_name: courseData.name,
									name: userData.name,
									email: userData.email,
									phone: userData.phone_number,
									payment_date:
										moment().format('DD-MMM-YYYY'),
									payment_amount: `$${object.amount / 100}`,
									sales_agent: userCourseData.sales_agent,
								}
								await addDataToSheet.addPurchasedSalesAgentToGS(
									gReq
								)
							} catch (error) {
								logger.stripeWehbook(
									`Stripe  error at google sheet ${error}`
								)
							}
						} else if (purchaseData.remian_payments > 1) {
							console.log('cartCourser', cartCourse.is_full_pay)
							console.log('stripe step 4')
							if (cartCourse.is_full_pay) {
								console.log('isFull pay in')
								const savePaymentInstallmentList =
									await paymentService.paymentInstallments(
										courseId,
										userId
									)
								let totalMct = mctAmount
								savePaymentInstallmentList.forEach(
									(eachPayment) => {
										totalMct +=
											eachPayment.mct_amount_on_purchase
									}
								)
								const finalMCTPrice =
									totalMct /
									(purchaseData.payment_devied_in -
										purchaseData.remian_payments +
										1)
								const purchaseAmount =
									(cartCourse.amount *
										purchaseData.payment_devied_in) /
									finalMCTPrice
								const updateCourseHistoryData = {
									mct_price_at_purchase: finalMCTPrice,
									purchased_amount: purchaseAmount,
									reward_amount:
										purchaseAmount + purchaseAmount * 0.2,
								}
								console.log(
									'updateCourseHistoryData',
									updateCourseHistoryData
								)
								const userCourseHistory =
									await courseService.userCourseData(
										courseId,
										userId
									)
								await courseService.updateUserCourseData(
									userCourseHistory.id,
									updateCourseHistoryData
								)
							}

							await paymentService.updatePayment(cartCourse.id, {
								status: 'success',
							})
							await courseService.userCourseUpdate(
								purchaseData.id,
								{
									remian_payments: cartCourse.is_full_pay
										? 0
										: purchaseData.remian_payments - 1,
									next_payment_date: cartCourse.is_full_pay
										? null
										: moment(
												purchaseData.next_payment_date
										  ).add(30, 'days'),
								}
							)
							await courseService.addUserTransaction({
								user_id: userId,
								transaction_id: paymentId,
								amount: cartCourse.amount,
								payment_with: 'stripe',
							})
							if (
								activeCampaignDealId !== 0 &&
								parseInt(courseId) === 55
							) {
								const newDealValue =
									parseInt(activeCampaignDealValue) +
									parseInt(object.amount)
								await activeCampagineHelper.updateActiveCampaignDeal(
									{
										deal: {
											stage: '840',
											currency: 'usd',
											value: newDealValue,

											fields: [
												{
													customFieldId: 3,
													fieldValue: moment(
														purchaseData.next_payment_date
													)
														.add(30, 'days')
														.format('DD-MMM-YYYY'),
												},
												{
													customFieldId: 4,
													fieldValue:
														purchaseData.payment_details,
												},
												{
													customFieldId: 5,
													fieldValue:
														purchaseData.remian_payments -
														1,
												},
											],
										},
									},
									activeCampaignDealId
								)
							}
							try {
								const gReq = {
									course_name: courseData.name,
									name: userData.name,
									email: userData.email,
									phone: userData.phone_number,
									payment_date:
										moment().format('DD-MMM-YYYY'),
									payment_amount: `$${object.amount / 100}`,
									sales_agent: userCourseData.sales_agent,
								}
								await addDataToSheet.addPurchasedSalesAgentToGS(
									gReq
								)
							} catch (error) {
								logger.stripeWehbook(
									`Stripe  error at google sheet ${error}`
								)
							}
						}
					} else {
						console.log('in herer for payment')
						console.log('stripe step 5')
						const prepareCourseHistory = {
							course_id: courseId,
							user_id: userId,
							started_at: null,
							// purchased_amount: Number(amount / mctPriceAtPurchase).toFixed(2),
							total_reward_earned: 0,
							// mct_price_at_purchase: mctPriceAtPurchase,
							transaction_id: paymentId,
						}
						await activeCampagineHelper.addTagsToContact(
							userData.dataValues.active_campagin_id,
							courseData.active_campagine_tag
						)
						await courseService.addCourseToUserData(
							prepareCourseHistory
						)
						await courseService.addUserTransaction({
							user_id: userId,
							transaction_id: paymentId,
							amount: cartCourse.amount,
							payment_with: 'stripe',
						})
						if (parseInt(courseId) === 55) {
							await commonHelper.purchaseDineroDesbloqueadoMail(
								userId
							)

							const phno =
								userData.phone_number.indexOf('+') === -1
									? '+' + userData.phone_number
									: userData.phone_number
							client.messages
								.create({
									body: `Hola ${userData.name},
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
											value: object.amount,
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
														userCourseData.payment_details,
												},
												{
													customFieldId: 5,
													fieldValue:
														userCourseData.remian_payments -
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
						try {
							const gReq = {
								course_name: courseData.name,
								name: userData.name,
								email: userData.email,
								phone: userData.phone_number,
								payment_date: moment().format('DD-MMM-YYYY'),
								payment_amount: `$${object.amount / 100}`,
								payment_divided_in:
									userCourseData.remian_payments,
								payment_method: userCourseData.payment_details,
								merchant: 'stripe',
								sales_agent: userCourseData.sales_agent,
							}
							await addDataToSheet.addPurchasedDataToGoogleSheet(
								gReq
							)
							await addDataToSheet.addPurchasedSalesAgentToGS(
								gReq
							)
						} catch (error) {
							logger.stripeWehbook(
								`Stripe  error at google sheet ${error}`
							)
						}
						await paymentService.updatePayment(cartCourse.id, {
							status: 'success',
						})
						await courseService.userCourseUpdate(
							userCourseData.id,
							{
								remian_payments:
									userCourseData.remian_payments - 1,
								next_payment_date: moment().add(30, 'days'),
								status: 1,
							}
						)
						if (userData.dataValues.active_campagin_id) {
							await activeCampagineHelper.addContactToList(
								userData.dataValues.active_campagin_id,
								config.PACKAGE_LIST
							)
						}
					}
				} else {
					let [cartCourse] =
						await courseService.getCourseListPayedByPaypal({
							stripe_id: paymentId,
						})
					let isCourseWithPack = false
					let isCourseWithDiscount = false
					let cartPackId
					let packageCourseList
					if (cartCourse?.dataValues?.package_id) {
						logger.stripeWehbook(`webhook for package purchase`)
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
						logger.stripeWehbook(`webhook for discount purchase`)

						cartCourse = cartCourse.dataValues
						isCourseWithDiscount = true
						cartPackId = cartCourse.id
						const discountDetails =
							await courseService.discountDetails(
								cartCourse.discount_id
							)
						totalAmount = discountDetails.discount_amount
						userId = cartCourse.user_id
					} else {
						logger.stripeWehbook(`webhook for course purchase`)
						cartCourse =
							await courseService.getCourseListPayedByPaypal({
								stripe_id: paymentId,
							})
					}
					for (let i = 0; i < cartCourse.length; i++) {
						userId = cartCourse[i].user_id
						const userData = await userService.userDetails(userId)

						if (!discountId) {
							discountId = cartCourse[i].used_discount_id
						}
						const courseId = cartCourse[i].course_id
						const isCourseWithSameName =
							await courseService.courseDetails(courseId, 'id')
						if (!isCourseWithSameName) {
							continue
						}
						const isCourseAlreadyPurchased =
							await courseService.getCourseListPayedByPaypal({
								course_id: courseId,
								stripe_id: paymentId,
								status: 1,
							})
						if (isCourseAlreadyPurchased.length) {
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
							await courseService.userCourseUpdate(
								cartCourse[i].id,
								{
									status: 1,
								}
							)
							await activeCampagineHelper.addTagsToContact(
								userData.dataValues.active_campagin_id,
								isCourseWithSameName.active_campagine_tag
							)
						}
						let purchaseAmount = Number(
							paidPrice / mctAmount
						).toFixed(2)
						let rewardAmount = paidPrice + (paidPrice * 20) / 100
						if (isCourseWithPack) {
							purchaseAmount =
								Number(
									packageCourseList.price / mctAmount
								).toFixed(2) / 7
							rewardAmount =
								purchaseAmount + (purchaseAmount * 20) / 100
							logger.stripeWehbook(
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
						logger.stripeWehbook(
							`Course Added to My learning ${courseId} ${cartCourse[i].user_id}`
						)
						if (parseInt(courseId) === 55) {
							try {
								await commonHelper.purchaseDineroDesbloqueadoMail(
									cartCourse[i].user_id
								)
								const phno =
									userData.phone_number.indexOf('+') === -1
										? '+' + userData.phone_number
										: userData.phone_number
								client.messages
									.create({
										body: `Hola ${userData.name},
											Bienvenido a la mentoría de Dinero Desbloqueado. Para facilitar tu acceso al curso, también te hemos enviado un correo electrónico con instrucciones paso a paso a la dirección que utilizaste para realizar la compra. Este correo incluye tu nombre de usuario y contraseña, en caso de que aún no estés registrado en nuestra plataforma. Por favor, responde a este mensaje con un "Sí" si deseas instrucciones y soporte a través de WhatsApp.`,
										from: 'whatsapp:+14704659604',
										to: `whatsapp:${phno}`,
									})
									.then((message) => console.log(message.sid))

								const activeCampaignDealResp =
									await activeCampagineHelper.getDealByPhoneNo(
										userData.phone_number
									)

								if (
									activeCampaignDealResp.data.deals[0] !==
									undefined
								) {
									activeCampaignDealId =
										activeCampaignDealResp.data.deals[0].id
									activeCampaignDealValue =
										activeCampaignDealResp.data.deals[0]
											.value
									activeCampaignContactId =
										activeCampaignDealResp.data.deals[0]
											.contact
								} else {
									const resp2 =
										await activeCampagineHelper.getDealByPhoneNo(
											userData.email
										)
									if (resp2.data.deals[0] !== undefined) {
										activeCampaignDealId =
											resp2.data.deals[0].id
										activeCampaignDealValue =
											resp2.data.deals[0].value
										activeCampaignContactId =
											resp2.data.deals[0].contact
									}
								}

								if (activeCampaignDealId !== 0) {
									const newDealValue = parseInt(object.amount)
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
							} catch (error) {
								logger.stripeWehbook(
									`Stripe  error at active campaign ${error}`
								)
							}
						}
						if (parseInt(courseId) === 56) {
							try {
								const activeCampaignDealResp =
									await activeCampagineHelper.getDealByPhoneNo(
										userData.phone_number,
										70
									)

								if (
									activeCampaignDealResp.data.deals[0] !==
									undefined
								) {
									activeCampaignDealId =
										activeCampaignDealResp.data.deals[0].id
									activeCampaignDealValue =
										activeCampaignDealResp.data.deals[0]
											.value
									activeCampaignContactId =
										activeCampaignDealResp.data.deals[0]
											.contact
								} else {
									const resp2 =
										await activeCampagineHelper.getDealByPhoneNo(
											userData.email,
											70
										)
									if (resp2.data.deals[0] !== undefined) {
										activeCampaignDealId =
											resp2.data.deals[0].id
										activeCampaignDealValue =
											resp2.data.deals[0].value
										activeCampaignContactId =
											resp2.data.deals[0].contact
									}
								}

								const newDealValue = parseInt(object.amount)
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
												contact:
													activeCampaignContactId,
												description:
													'Deal created from mundocrypto.com',
												currency: 'usd',
												group: '70',
												owner: '1',
												percent: null,
												stage: '852',
												status: 1,
												title: userData.name,
												value: newDealValue,
											},
										}
									)
								}
							} catch (error) {
								logger.stripeWehbook(
									`Stripe  error at active campaign ${error}`
								)
							}
						}
						try {
							const gReq = {
								course_name: isCourseWithSameName.name,
								name: userData.name,
								email: userData.email,
								phone: userData.phone_number,
								payment_date: moment().format('DD-MMM-YYYY'),
								payment_amount: `$${object.amount / 100}`,
								payment_divided_in: 0,
								payment_method: `$${object.amount / 100}`,
								merchant: 'stripe',
								sales_agent: cartCourse[i].sales_agent,
							}
							await addDataToSheet.addPurchasedDataToGoogleSheet(
								gReq
							)
							await addDataToSheet.addPurchasedSalesAgentToGS(
								gReq
							)
						} catch (error) {
							logger.stripeWehbook(
								`Stripe  error at google sheet ${error}`
							)
						}
						await courseService.addCourseToUserData(
							prepareCourseHistory
						)
						await courseService.removeToCart(
							courseId,
							cartCourse[i].user_id
						)
					}
					if (totalAmount) {
						const userData = await userService.userDetails(userId)
						if (isCourseWithPack) {
							totalAmount = packageCourseList.price
							if (discountId) {
								const discountData =
									await courseService.packageDetails(
										discountId,
										0
									)
								totalAmount -= discountData.price
							}
						}
						const transactionObj = {
							user_id: userId,
							transaction_id: paymentId,
							amount: totalAmount,
							payment_with,
							used_discount_id: discountId,
						}
						const walletData = await userService.walletData(userId)
						if (cartCourse[0]?.mc_amount) {
							await userService.deductMctFromWallet(userId, {
								token_balance:
									walletData.token_balance -
									cartCourse[0]?.mc_amount,
							})
							await userService.addWalletHistory({
								user_id: userId,
								amount: cartCourse[0].mc_amount,
								transaction_type: 'debit',
							})
						}
						logger.stripeWehbook(
							`Transaction Obj ${JSON.stringify(transactionObj)}`
						)
						await courseService.addUserTransaction(transactionObj)

						if (discountId) {
							logger.stripeWehbook(`Discount used ${discountId}`)
							await courseService.updateDiscountIdMarktAsUsed(
								discountId,
								userId
							)
						}
						if (isCourseWithPack) {
							logger.stripeWehbook(
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
							logger.stripeWehbook(
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
							//await commonHelper.purchaseMail(userId);
						} else {
							await activeCampagineHelper.addContactToList(
								userData.dataValues.active_campagin_id,
								config.PACKAGE_LIST
							)
						}
					}
				}
			}
		}
		logger.stripeWehbook(`Stripe webhook completed with success`)
		return res.send({
			msg: 'purchase success',
		})
	} catch (err) {
		logger.stripeWehbook(`Stripe webhook completed with error ${err}`)
		return res.status(200).send({
			msg: 'purchase failed',
			err,
		})
	}
}

const nftMintLogic = async (paymentId) => {
	try {
		let userId

		payment_with = 'stripe'
		let nftPurchaseData = await nftPurchaseModel.findOne({
			where: {
				transaction_id: paymentId,
			},
			attributes: [
				'id',
				'course_id',
				'user_id',
				'transaction_id',
				'status',
				'amount',
				'mct_price_at_purchase',
			],
		})

		userId = nftPurchaseData.user_id
		const userData = await userService.userDetails(userId)
		const courseId = nftPurchaseData.course_id

		const courseData = await courseService.courseDetails(courseId, 'id')
		await courseService.addUserTransaction({
			user_id: userId,
			transaction_id: paymentId,
			amount: courseData.nft_purchase_price,
			payment_with: 'coinbase',
		})
		await nftPurchaseModel.update(
			{
				status: 1,
			},
			{
				where: {
					status: 0,
					purchase_with: 'coinbase',
					transaction_id: paymentId,
				},
			}
		)
		await commonHelper.generateNFT(courseId, userId)
	} catch (error) {
		console.log('error', error)
	}
}
