const AWS = require('aws-sdk')
const nodemailer = require('nodemailer')
const logger = require('../config/logger')
const config = require('../config/config')
const confirmEmailHtml = require('../emailTemplates/confirm_user')
const welcomeEmailTemplate = require('../emailTemplates/welcomeMail')
const welcomeWithPurchaseTemplate = require('../emailTemplates/welcomeMailWithPurchase')
const accountCreateTemplate = require('../emailTemplates/createAccount')
const freeCourseExamPassClainRewardNotifyTemplate = require('../emailTemplates/clain_mc_reward')
const forgotPasswordTemplate = require('../emailTemplates/forgotpassword')
const purchasedTemplate = require('../emailTemplates/purchaseMail')
const dinerodesbloqueadoemplate = require('../emailTemplates/dinero-desbloqueado-mail')
const pendingpaymentemplate = require('../emailTemplates/payment-remainder-mail')

const exampasstemplate = require('../emailTemplates/exam-pass-mail')
const examfailtemplate = require('../emailTemplates/exam-fail-mail')

const firstalarmTemplate = require('../emailTemplates/es/firstalarm')
const progressUpdateTemplate = require('../emailTemplates/es/progressUpdate')
const midwayRemainderTemplate = require('../emailTemplates/es/midwayRemainder')
const finalStrechTemplate = require('../emailTemplates/es/finalStrech')

const SES_CONFIG = {
	accessKeyId: config.AWS_ACCESS_KEY,
	secretAccessKey: config.AWS_SECRET_KEY,
	region: config.AWS_REGION,
}

const ccEmails = []
const bccEmails = []
const AWS_SES = new AWS.SES(SES_CONFIG)

const sendEmail = async ({ type, data }) => {
	console.log('data', data)
	let notSend = false
	const params = {
		Source: 'no-reply@mundocrypto.com',
		Destination: {
			ToAddresses: [data.email],
			CcAddresses: [],
		},
		ReplyToAddresses: [],
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: '',
				},
			},
			Subject: {
				Charset: 'UTF-8',
				Data: ``,
			},
		},
	}
	switch (type) {
		case 'forgot-password':
			params.Message.Body.Html.Data = forgotPasswordTemplate(data)
			params.Message.Subject.Data = `Recordar Contraseña`
			break
		case 'confirm-email':
			// params.Message.Body.Html.Data = confirmEmailHtml(data);
			// params.Message.Subject.Data = `Confirm Email`;
			break
		case 'welcome':
			notSend = true
			params.Message.Body.Html.Data = welcomeEmailTemplate(data)
			params.Message.Subject.Data = `Bienvenido a MundoCrypto Academy`
			break
		case 'course-purchased':
			notSend = true
			params.Message.Body.Html.Data = purchasedTemplate(data)
			params.Message.Subject.Data = `Pedido confirmado - MundoCrypto`
			break
		case 'welcome-with-purchase':
			params.Message.Body.Html.Data = welcomeWithPurchaseTemplate(data)
			params.Message.Subject.Data = `Bienvenido a MundoCrypto Academy`
			params.Destination.CcAddresses = ccEmails
			break
		case 'account-create':
			params.Message.Body.Html.Data = accountCreateTemplate(data)
			params.Message.Subject.Data = `¡Bienvenido/a a MundoCrypto!`
			params.Destination.CcAddresses = ccEmails
			break
		case 'claim-mc-reward':
			params.Message.Body.Html.Data =
				freeCourseExamPassClainRewardNotifyTemplate(data)
			params.Message.Subject.Data = `🎉¡Enhorabuena! Has recibido $1000 MCT como recompensa`
			params.Destination.CcAddresses = ccEmails
			break
		case 'first-alarm':
			params.Message.Body.Html.Data = firstalarmTemplate(data)
			//params.Message.Subject.Data = `Get Ready to Dive In!`
			params.Message.Subject.Data = `¡Prepárate para sumergirte!`
			params.Destination.CcAddresses = ccEmails
			break
		case 'progress-update':
			params.Message.Body.Html.Data = progressUpdateTemplate(data)
			//params.Message.Subject.Data = `Checking in on Your Learning Progress`
			params.Message.Subject.Data = `Comprobación de su progreso de aprendizaje`
			params.Destination.CcAddresses = ccEmails
			break
		case 'midway-remainder':
			params.Message.Body.Html.Data = midwayRemainderTemplate(data)
			//params.Message.Subject.Data = `Halfway There! Keep Going Strong!`
			params.Message.Subject.Data = `¡A mitad de camino! ¡Sigue fuerte!`
			params.Destination.CcAddresses = ccEmails
			break
		case 'final-stretch':
			params.Message.Body.Html.Data = finalStrechTemplate(data)
			//params.Message.Subject.Data = `You're Almost There! Finish Strong!`
			params.Message.Subject.Data = `¡Ya casi estás ahí! ¡Terminar fuerte!`
			params.Destination.CcAddresses = ccEmails
			break
		case 'dinero-desbloqueado':
			params.Message.Body.Html.Data = dinerodesbloqueadoemplate(data)
			//params.Message.Subject.Data = `You're Almost There! Finish Strong!`
			params.Message.Subject.Data = `DINERO DESBLOQUEADO`
			params.Destination.CcAddresses = ccEmails
			break
		case 'payment-remainder':
			params.Message.Body.Html.Data = pendingpaymentemplate(data)
			//params.Message.Subject.Data = `You're Almost There! Finish Strong!`
			params.Message.Subject.Data = `Solo quedan ${data.days} días para maximizar la mentoría de Mani Thawani! 🚀🌟`
			params.Destination.CcAddresses = ccEmails
			break
		case 'exam-pass':
			params.Message.Body.Html.Data = exampasstemplate(data)
			//params.Message.Subject.Data = `You're Almost There! Finish Strong!`
			params.Message.Subject.Data = `¡Felicitaciones! Aprobaste el primer examen del Master de IA`
			params.Destination.CcAddresses = ccEmails
			break
		case 'exam-fail':
			params.Message.Body.Html.Data = examfailtemplate(data)
			//params.Message.Subject.Data = `You're Almost There! Finish Strong!`
			params.Message.Subject.Data = `Resultados del primer examen del Master de IA`
			params.Destination.CcAddresses = ccEmails
			break
	}
	try {
		if (notSend) {
			logger.info('Email service Stoped')
			return
		}
		logger.info('Email send')
		await sendMicrosoftEmail(
			data.email,
			params.Message.Subject.Data,
			params.Message.Body.Html.Data
		)
		//return await AWS_SES.sendEmail(params).promise()
	} catch (err) {
		logger.error(`Email sent error ${err}`)
	}
}

const sendMicrosoftEmail = async (to, subject, html) => {
	try {
		const transporter = nodemailer.createTransport({
			service: 'Outlook365',
			host: 'smtp.office365.com',
			port: '587',
			tls: {
				ciphers: 'SSLv3',
				rejectUnauthorized: false,
			},
			auth: {
				user: 'noreply@mundocrypto.com',
				pass: 'o@x&Qs!^pvw&AJT7g',
			},
		})

		const mailOptions = {
			from: 'noreply@mundocrypto.com',
			to,
			subject,
			html,
		}

		await transporter.sendMail(mailOptions)
		console.log('Mail Sent successfully.')
	} catch (e) {
		console.log('Error sending email: ', e)
	}
}

const sendTemplateEmail = (recipientEmail) => {
	try {
		const params = {
			Source: '<email address you verified>',
			Template: '<name of your template>',
			Destination: {
				ToAddresse: [recipientEmail],
			},
			TemplateData: "{ \"name':'John Doe'}",
		}
		return AWS_SES.sendTemplatedEmail(params).promise()
	} catch (err) {
		logger.error(`Email sent error ${err}`)
	}
}

module.exports = {
	sendEmail,
	sendTemplateEmail,
}
