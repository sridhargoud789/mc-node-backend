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
const paymentService = require('../dbService/payment.service')
const courseUserModel = dbObj.courses_users
const paymentInstallmentsModel = dbObj.payment_installments
const quickBookService = require('../dbService/quickbook.service')
const env = config.NODE_ENV || 'development'

const accountSid = 'AC6d9cd24c093a42df79c8c9911e490edb'
const authToken = '62b83d76f6b8fba0f843975182d500f5'
const client = require('twilio')(accountSid, authToken)

const addDataToSheet = require('../helpers/addDataToSheet.helper')

cron.schedule('* * * * *', async () => {
	// logger.cron('Coinbase commerce partial pay cron start');
	try {
		const coinmarketCapData = await paymentInstallmentsModel.findAll({
			where: {
				status: 'pending',
				payment_with: 'coinbase',
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
		console.log('coinmarket', coinmarketCapData)
		const promiseList = []
		const coinbasePaymentData = []
		coinmarketCapData.forEach((eachcoinmarketCapPayment) => {
			const coinmarketData = eachcoinmarketCapPayment.dataValues
			const promise = new Promise(async (resolve, reject) => {
				const data = await coinmarketcapHelper.getChargeData(
					coinmarketData.transaction_id
				)
				coinbasePaymentData.push({
					data,
					id: coinmarketData.id,
					code: coinmarketData.transaction_id,
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
			const { payments, timeline } = eachCoinbasePayment
			let isPaymentConfirm = false
			timeline.forEach((eachTimeline) => {
				if (eachTimeline.status === 'COMPLETED') {
					isPaymentConfirm = true
				}
			})
			console.log('in hererr')
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
				console.log('paymentData', paymentData)
				// logger.coinbaseCommerceChangeLog(`Code ${eachCoinbasePayment.code} change to payment success course_user id is ${id}`);
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
					// logger.coinbaseCommerceChangeLog(`Code ${code} change to payment fail course_user id is ${id}`);
					await paymentService.updatePayment(id, { status: 'failed' })
				}
			}
		}
		// logger.cron('Coinbase commerce pa cron end');
	} catch (err) {
		console.log('err', err)
		// logger.cron(`Coinbase commerce cron error ${err}`);
	}
})

const coinbaseCommerceWebhookLogic = async (req) => {
	try {
		const paymentId = req.body.event.data.code
		// logger.coinbaseCommerceChangeLog(`Coinbase payment code ${paymentId}`)
		const paypalData = req.body.event
		let totalAmount = 0
		let userId
		const tokenAv = await commonService.calculateTokenAvg()
		const responseData = commonHelper.avgPriceOfMCT(tokenAv)
		const mctAmount = responseData.price
		const calculatedMctPrice = await commonService.calculateTokenAvg()
		const mctP = await commonHelper.avgPriceOfMCT(calculatedMctPrice)
		const mctPriceAtPurchase = mctP.price

		if (paypalData && paypalData?.type === 'charge:confirmed') {
			// logger.coinbaseCommerceChangeLog(`in charge confirm`)

			payment_with = 'coinbase'
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

			const courseData = await courseService.courseDetails(courseId, 'id')
			quickBookService.createInvoice(userId, courseId, cartCourse.amount)
			const userCourseData = await courseUserModel.findOne({
				where: {
					course_id: courseId,
					user_id: userId,
					is_partial_payment: 1,
					// each_payment_amount: cartCourse.amount,
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
			let activeCampaignDealId = 0
			let activeCampaignDealValue = 0
			let activeCampaignContactId = 0
			try {
				const activeCampaignDealResp =
					await activeCampagineHelper.getDealByPhoneNo(
						userData.phone_number
					)

				if (activeCampaignDealResp.data.deals[0] !== undefined) {
					activeCampaignDealId =
						activeCampaignDealResp.data.deals[0].id
					activeCampaignDealValue =
						activeCampaignDealResp.data.deals[0].value
					activeCampaignContactId =
						activeCampaignDealResp.data.deals[0].contact
				} else {
					const resp2 = await activeCampagineHelper.getDealByPhoneNo(
						userData.email
					)
					if (resp2.data.deals[0] !== undefined) {
						activeCampaignDealId = resp2.data.deals[0].id
						activeCampaignDealValue = resp2.data.deals[0].value
						activeCampaignContactId = resp2.data.deals[0].contact
					}
				}
			} catch (error) {
				logger.coinaseWebhook(
					`Coinbase error at active campaign ${error}`
				)
			}
			if (
				userCourseData.payment_devied_in !=
				userCourseData.remian_payments
			) {
				let purchaseData = userCourseData
				if (purchaseData.remian_payments == 1) {
					await paymentService.updatePayment(cartCourse.id, {
						status: 'success',
					})
					const savePaymentInstallmentList =
						await paymentService.paymentInstallments(
							courseId,
							userId
						)
					let totalMct = mctPriceAtPurchase
					savePaymentInstallmentList.forEach((eachPayment) => {
						totalMct += eachPayment.mct_amount_on_purchase
					})
					const finalMCTPrice =
						totalMct / purchaseData.payment_devied_in
					const purchaseAmount =
						(cartCourse.amount * purchaseData.payment_devied_in) /
						finalMCTPrice
					const updateCourseHistoryData = {
						mct_price_at_purchase: finalMCTPrice,
						purchased_amount: purchaseAmount,
						reward_amount: purchaseAmount + purchaseAmount * 0.2,
					}
					const userCourseHistory =
						await courseService.userCourseData(courseId, userId)
					await courseService.updateUserCourseData(
						userCourseHistory.id,
						updateCourseHistoryData
					)
					await courseService.userCourseUpdate(purchaseData.id, {
						remian_payments: 0,
						next_payment_date: null,
					})
					await courseService.addUserTransaction({
						user_id: userId,
						transaction_id: paymentId,
						amount: cartCourse.amount,
						payment_with: 'coinbase',
					})

					if (
						activeCampaignDealId !== 0 &&
						parseInt(courseId) === 55
					) {
						const newDealValue =
							parseInt(activeCampaignDealValue) +
							parseInt(cartCourse.amount)
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
							payment_date: moment().format('DD-MMM-YYYY'),
							payment_amount: `$${cartCourse.amount}`,
							sales_agent: userCourseData.sales_agent,
						}
						await addDataToSheet.addPurchasedSalesAgentToGS(gReq)
					} catch (error) {
						logger.stripeWehbook(
							`Stripe  error at google sheet ${error}`
						)
					}
				} else if (purchaseData.remian_payments > 1) {
					if (purchaseData.is_full_pay) {
						const savePaymentInstallmentList =
							await paymentService.paymentInstallments(
								courseId,
								userId
							)
						let totalMct = mctPriceAtPurchase
						savePaymentInstallmentList.forEach((eachPayment) => {
							totalMct += eachPayment.mct_amount_on_purchase
						})
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
						const userCourseHistory =
							await courseService.userCourseData(courseId, userId)
						await courseService.updateUserCourseData(
							userCourseHistory.id,
							updateCourseHistoryData
						)
					}
					await paymentService.updatePayment(cartCourse.id, {
						status: 'success',
					})
					await courseService.userCourseUpdate(purchaseData.id, {
						remian_payments: purchaseData.is_full_pay
							? 0
							: purchaseData.remian_payments - 1,
						next_payment_date: purchaseData.is_full_pay
							? null
							: moment(purchaseData.next_payment_date).add(
									30,
									'days'
							  ),
					})
					await courseService.addUserTransaction({
						user_id: userId,
						transaction_id: paymentId,
						amount: cartCourse.amount,
						payment_with: 'coinbase',
					})

					if (
						activeCampaignDealId !== 0 &&
						parseInt(courseId) === 55
					) {
						const newDealValue =
							parseInt(activeCampaignDealValue) +
							parseInt(cartCourse.amount)
						await activeCampagineHelper.updateActiveCampaignDeal(
							{
								deal: {
									stage: '840',
									currency: 'usd',
									value: newDealValue,

									fields: [
										{
											customFieldId: 3,
											fieldValue: purchaseData.is_full_pay
												? null
												: moment(
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
											fieldValue: purchaseData.is_full_pay
												? 0
												: purchaseData.remian_payments -
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
							payment_date: moment().format('DD-MMM-YYYY'),
							payment_amount: `$${cartCourse.amount}`,
							payment_divided_in: purchaseData.is_full_pay
								? 0
								: purchaseData.remian_payments,
							payment_method: userCourseData.payment_details,
							merchant: 'coinbase',
							sales_agent: userCourseData.sales_agent,
						}
						await addDataToSheet.addPurchasedDataToGoogleSheet(gReq)
						await addDataToSheet.addPurchasedSalesAgentToGS(gReq)
					} catch (error) {
						logger.stripeWehbook(
							`Coinbase error at google sheet ${error}`
						)
					}
				}
			} else {
				console.log('in herer for payment')
				const prepareCourseHistory = {
					course_id: courseId,
					user_id: userId,
					started_at: null,
					total_reward_earned: 0,
					transaction_id: paymentId,
				}
				await activeCampagineHelper.addTagsToContact(
					userData.dataValues.active_campagin_id,
					courseData.active_campagine_tag
				)
				await courseService.addCourseToUserData(prepareCourseHistory)
				await courseService.addUserTransaction({
					user_id: userId,
					transaction_id: paymentId,
					amount: cartCourse.amount,
					payment_with: 'coinbase',
				})

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
					if (activeCampaignDealId !== 0) {
						await activeCampagineHelper.updateActiveCampaignDeal(
							{
								deal: {
									stage: '842',
									currency: 'usd',
									value: cartCourse.amount,
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
						payment_amount: `$${cartCourse.amount}`,
						payment_divided_in: userCourseData.remian_payments,
						payment_method: userCourseData.payment_details,
						merchant: 'coinbase',
						sales_agent: userCourseData.sales_agent,
					}
					await addDataToSheet.addPurchasedDataToGoogleSheet(gReq)
					await addDataToSheet.addPurchasedSalesAgentToGS(gReq)
				} catch (error) {
					logger.stripeWehbook(
						`Coinbase error at google sheet ${error}`
					)
				}

				await paymentService.updatePayment(cartCourse.id, {
					status: 'success',
				})
				await courseService.userCourseUpdate(userCourseData.id, {
					remian_payments: userCourseData.remian_payments - 1,
					next_payment_date: moment().add(30, 'days'),
					status: 1,
				})
				if (userData.dataValues.active_campagin_id) {
					await activeCampagineHelper.addContactToList(
						userData.dataValues.active_campagin_id,
						config.PACKAGE_LIST
					)
				}
			}
		}
	} catch (error) {
		console.log('error', error)
	}
}
