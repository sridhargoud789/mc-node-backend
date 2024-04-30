const CryptoJS = require('crypto-js')
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const SHA256 = require('crypto-js/sha256')
const dbObj = require('../../models/index')
const userService = require('../dbService/user.service')
const courseService = require('../dbService/course.services')
const emailHelper = require('../helpers/email.helper')
const { pinataHelper } = require('./pinata')
const nftHelper = require('./nftMint')
const jwtHelper = require('./jwt')
const config = require('../config/config')
const otpGen = require('otp-generator')
const sequelize = require('sequelize')
const { userCoursesDetails } = require('../dbService/course.services')

const courseModel = dbObj.courses
const coursePackageModel = dbObj.course_packages

const accountSid = 'AC6d9cd24c093a42df79c8c9911e490edb'
const authToken = '62b83d76f6b8fba0f843975182d500f5'
const client = require('twilio')(accountSid, authToken)
const encryptString = (plainText) => {
	return CryptoJS.AES.encrypt(plainText, config.ENCRYPTION_KEY).toString()
}

const decryptString = (ciphertext) => {
	const bytes = CryptoJS.AES.decrypt(ciphertext, config.ENCRYPTION_KEY)
	return bytes.toString(CryptoJS.enc.Utf8)
}

const shaPassword = (pass) => {
	return SHA256(pass).toString()
}

const signupConfirmEmailDataHelper = async (id, email, name = 'User') => {
	const data = { email: email, id: id }
	const encryptData = jwtHelper.encrypt(data)
	await userService.updateUser(id, { confirm_email_token: encryptData })
	const link = `${config.FRONT_DOMAIN}verify-email\\${encryptData}`
	await emailHelper.sendEmail({
		type: 'confirm-email',
		data: { email, name, link },
	})
	return
}

const avgPriceOfMCT = (data) => {
	let amount = 0
	let total = 0
	if (data.coingeco != 0) {
		amount += Number(data.coingeco)
		total++
	}
	if (data.coinmarketcap != 0) {
		amount += Number(data.coinmarketcap)
		total++
	}
	if (data.coinranking != 0) {
		amount += Number(data.coinranking)
		total++
	}
	if (data.bybit != 0) {
		amount += Number(data.bybit)
		total++
	}
	if (data.waves != 0) {
		amount += Number(data.waves)
		total++
	}
	const change = amount / total > data.avg_24h ? 'up' : 'down'
	const responseData = {
		change,
		price: amount / total,
		avg_24h: data.avg_24h,
	}
	return responseData
}

const packagePrice = async () => {
	return await coursePackageModel.findOne({
		where: {
			id: 1,
		},
		attributes: ['price'],
	})
}

const totalCoursePrice = async () => {
	return await courseModel.findOne({
		where: {
			is_published: 1,
		},
		attributes: [
			[
				sequelize.literal(
					'(SELECT SUM(`price`) FROM courses WHERE `courses`.`is_published` = 1)'
				),
				'packagePrice',
			],
		],
	})
}

const purchaseMail = async (userId) => {
	const userDetails = await userService.userDetails(userId)
	const data = {
		email: userDetails.email,
		FRONT_DOMAIN: process.env.FRONT_DOMAIN,
	}
	await emailHelper.sendEmail({ type: 'course-purchased', data })
	return
}

const purchaseDineroDesbloqueadoMail = async (userId) => {
	const userDetails = await userService.userDetails(userId)
	const data = {
		email: userDetails.email,
		FRONT_DOMAIN: process.env.FRONT_DOMAIN,
		username: userDetails.name,
	}
	await emailHelper.sendEmail({ type: 'dinero-desbloqueado', data })
	return
}

const notify_examresult_email = async (
	email,
	username,
	is_passed,
	percentage
) => {
	const data = {
		email,
		FRONT_DOMAIN: process.env.FRONT_DOMAIN,
		username,
		percentage,
	}
	const type = is_passed === 1 ? 'exam-pass' : 'exam-fail'
	await emailHelper.sendEmail({ type, data })
	return
}

const payment_remainder_mail = async (
	email,
	username,
	days,
	payment_date,
	remaining_payments
) => {
	const data = {
		email,
		FRONT_DOMAIN: process.env.FRONT_DOMAIN,
		username,
		days,
		payment_date,
		remaining_payments,
	}
	await emailHelper.sendEmail({ type: 'payment-remainder', data })
	return
}
const payment_remainder_whatsapp = async (
	username,
	remaining_payments,
	phone_number
) => {
	const msg = `Buenas tardes, ${username}

Te escribo desde el equipo de Dinero Desbloqueado. Espero que te encuentres bien, que estés al día con los formularios y que te estés preparando para los 90 días de mentoría. 😊

⚠️ Quiero recordarte que has optado por el fraccionamiento del pago de la mentoría y que nuestra plataforma no realiza cobros automáticos en ningún momento. El seguimiento y responsabilidad de los pagos recae en el alumno. Puedes efectuar tu siguiente pago en la sección "payments" de tu cuenta o directamente a través de este enlace : https://www.mundocrypto.com/privatearea/mylearnings
Recalcar que quedan 2 días para la fecha límite de tu siguiente pago de ${remaining_payments}. Recuerda que contamos con un sistema automatizado; si no se realiza el pago, el acceso a la mentoría se rescindirá automáticamente.

Por favor, ante cualquier duda, contacta con nuestro equipo de soporte en https://wa.me/971588163253`

	const phno =
		phone_number.indexOf('+') === -1 ? '+' + phone_number : phone_number
	client.messages
		.create({
			body: msg,
			from: 'whatsapp:+14704659604',
			to: `whatsapp:${phno}`,
		})
		.then((message) => console.log(message.sid))
	return
}

const calculateRewardPercentage = (mctPrice, coursePrice) => {
	const mctAmount = coursePrice / mctPrice
	const extraRewardAmount = mctAmount * 0.2
	return mctAmount + extraRewardAmount
}

const duration = (startTime, endTime) => {
	if (!endTime) {
		endTime = moment()
	} else {
		endTime = moment(endTime)
	}
	const d = moment.duration(endTime.diff(moment(startTime)))
	return d.asHours().toFixed(0)
}

const calculateAccessibleModules = async (
	courseData,
	userId,
	requestedModuleId
) => {
	const coursePurhaseData = await userCoursesDetails(courseData.id, userId)
	const moduleArr = []
	const result = { isAccess: true, userAccessibleModules: [] }
	courseData.courseModules.forEach((eachModule) => {
		moduleArr.push(eachModule.id)
	})
	if (!coursePurhaseData?.payment_devied_in) {
		return moduleArr
	}
	const availablePart =
		((coursePurhaseData.payment_devied_in -
			coursePurhaseData.remian_payments) *
			100) /
		coursePurhaseData.payment_devied_in
	if (availablePart >= 100) {
		return moduleArr
	}
	result.userAccessibleModules = (
		(moduleArr.length * availablePart) /
		100
	).toFixed(0)
	return moduleArr.splice(0, result.userAccessibleModules)
}

const generateUId = () => {
	return uuidv4()
}

const otp = () => {
	return otpGen.generate(6, {
		lowerCaseAlphabets: false,
		upperCaseAlphabets: false,
		specialChars: false,
	})
}

const generateNFT = async (courseId, userId) => {
	try {
		const courseData = await courseService.courseDetails(courseId, 'id')
		if (!courseData) {
			response.helper(res, false, 'COURSE_NOT_FOUND', {}, 200)
		}
		const userDetails = await userService.userDetails(userId)
		const userCourseHistory = await courseService.userCourseData(
			courseId,
			userId
		)
		if (!userCourseHistory?.is_nft_minted) {
			const userWalletDetails = await userService.isUserHaveDefaultWallet(
				userId
			)
			const du =
				userCourseHistory.completed_at == userCourseHistory.started_at
					? null
					: duration(
							userCourseHistory.started_at,
							userCourseHistory.completed_at
					  )
			const nftData = {
				courseName: courseData.name,
				courseDescription:
					courseData.description || courseData.sub_title,
				username: userWalletDetails?.wallet_address,
				duration: `${courseData.duration} Hours`,
			}
			const pinataResponse = await pinataHelper(nftData)
			const nftTransactionResponse = await nftHelper.mintNFT(
				[userWalletDetails?.wallet_address],
				[pinataResponse.IpfsHash]
			)
			pinataResponse.nft_id = Number(
				nftTransactionResponse.logs[0].topics[3]
			)
			await courseService.updateUserCourseData(userCourseHistory.id, {
				nft_data: pinataResponse,
				is_nft_minted: 1,
			})
			return true
		} else {
			return false
		}
	} catch (err) {
		console.log(`err in generating nft`, err)
		return false
	}
}

const rendomString = () => {
	return otpGen.generate(10)
}

const calculateRewardAmount = (historyUserCourseData, totalExams) => {
	try {
		const rewardAmountPercentage = 30
		if (historyUserCourseData.course_id === 38) {
			return 0
		} else {
			const historyReward = Number(
				(historyUserCourseData.purchased_amount *
					rewardAmountPercentage) /
					100
			).toFixed()
			return historyReward / (totalExams || 1)
		}
	} catch (err) {
		return 0
	}
}

module.exports = {
	calculateRewardAmount,
	rendomString,
	generateNFT,
	otp,
	generateUId,
	calculateAccessibleModules,
	duration,
	calculateRewardPercentage,
	encryptString,
	decryptString,
	shaPassword,
	signupConfirmEmailDataHelper,
	avgPriceOfMCT,
	packagePrice,
	totalCoursePrice,
	purchaseMail,
	purchaseDineroDesbloqueadoMail,
	payment_remainder_mail,
	payment_remainder_whatsapp,
	notify_examresult_email,
}
