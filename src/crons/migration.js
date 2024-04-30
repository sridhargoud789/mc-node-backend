const response = require('../helpers/response.helper')
const userService = require('../dbService/user.service')
const courseService = require('../dbService/course.services')
const examService = require('../dbService/exam.services')
const awsHelper = require('../helpers/aws.helper')
const config = require('../config/config')
const paypalHelper = require('../helpers/paypal.helper')
const web3Helper = require('../helpers/web3.helper')
const coinbaseCommerceHelper = require('../helpers/coinbase.helper')
const moment = require('moment')
const commonHelper = require('../helpers/common.helper')
const commonService = require('../dbService/common.service')
const paymentService = require('../dbService/payment.service')
const stripeHelper = require('../helpers/stripe.helper')
const activeCampagineHelper = require('../helpers/activecampaign')
const logger = require('../config/logger')
const { pinataHelper } = require('../helpers/pinata')
const nftHelper = require('../helpers/nftMint')
const requestIp = require('request-ip')
const googleSheetHelper = require('../helpers/googleSheet.helper')
const mailHelper = require('../helpers/email.helper')

const fs = require('fs')
const { Readable } = require('stream')
const nodeHtmlToImage = require('node-html-to-image')
const cron = require('node-cron')
const data = require('../../data/stripedata.json')

const main = async () => {
	const obj = data.data
	const courseId = 55
	

	obj.map(async (d, i) => {
		let userId = 0
		const email = d.CORREO
		const name = d.NOMBRE
		const phone_number = d.TELEFONO.replace(/[^\d\+]/g,'')
		const partialTime = d.partialTime
		const stripe_id = d.stripe_id
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
			const user = await userService.saveUser(userData)
			await mailHelper.sendEmail({
				type: 'account-create',
				data: {
					email,
					FRONT_DOMAIN: process.env.FRONT_DOMAIN,
					password: decryptPassword,
					username: name,
				},
			})
			userId = user.id
		}

		const isCourseAlreadyPurchased = await courseService.userCoursesDetails(
			courseId,
			userId
		)
		if (!isCourseAlreadyPurchased) {
			const courseHistoryList = []
			const courseDetails = await courseService.courseDetails(
				courseId,
				'id'
			)
			console.log(`creating purchase for ${userId}`)
			const ppOBJ = JSON.parse(courseDetails.partialpay_stripe_price_obj)
			
			if (partialTime === 0) {
			const 	courseUserTransactionData = {
					course_id: courseId,
					user_id: userId,
					stripe_id,
					status: 1,
					is_partial_payment: 0,
					user_ip: '',
				}
				const userCourse = await courseService.addCourseToUserTransaction(
					courseUserTransactionData
				)
				courseHistoryList.push(userCourse)
			} else {
				const courseUserTransactionData = {
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
				}
				const userCourse = await courseService.addCourseToUserTransaction(
					courseUserTransactionData
				)
				courseHistoryList.push(userCourse)
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
			await commonHelper.purchaseDineroDesbloqueadoMail(userId)
			console.log('completed')
		}
	})
}

module.exports = {
	main,
}
