const cron = require('node-cron')
const logger = require('../config/logger.js')
const axios = require('axios')
const commonHelper = require('../helpers/common.helper')
const mailHelper = require('../helpers/email.helper.js')
const activeCampagineHelper = require('../helpers/activecampaign')
const db = require('../../models')
const nodemailer = require('nodemailer')

const coinbaseCommerceHelper = require('../helpers/coinbase.helper')
const {
	getUserCourseRemainders,
	first_remainder_sent,
	second_remainder_sent,
	third_remainder_sent,
	fourth_remainder_sent,
} = require('../dbService/course.services.js')
const quickBookService = require('../dbService/quickbook.service')
const coinmarketcapHelper = require('../helpers/coinbase.helper')
const _ = require('lodash')
const dbObj = require('../../models/index')

const paymentInstallmentsModel = dbObj.payment_installments
const addDataToSheet = require('../helpers/addDataToSheet.helper')

const data = [
	{
		id: 8227,
		CourseName: 'ELITE DEL TRADING',
		course_id: 56,
		created_at: '2024-01-05 13:11:04',
		name: 'Lina Maria Valdes Velasco',
		email: 'eucaris4070@gmail.com',
		phone_number: '34635827424',
		amount: 1886.66,
	},
	{
		id: 8226,
		CourseName: 'ELITE DEL TRADING',
		course_id: 56,
		created_at: '2024-01-05 13:09:05',
		name: 'Jaume Gonzalez Parra',
		email: 'gonzalez.jaume.mrm@gmail.com',
		phone_number: '34661165074',
		amount: 1886.66,
	},
	{
		id: 4104,
		CourseName: 'DINERO DESBLOQUEADO',
		course_id: 55,
		created_at: '2024-01-05 08:22:13',
		name: 'Ramiro Sanchez Sarria ',
		email: 'ramirosanchezjm@gmail.com',
		phone_number: '+34601117104',
		amount: 472,
	},
]

const triggerInvoices = async () => {
	data.map(async (d) => {
		const resp = await quickBookService.createInvoice(
			d.id,
			d.course_id,
			d.amount,
			'USD'
		)
	})
}

const sendEmail = async () => {
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
			to: 'sridhar.goud@mundocrypto.com',
			subject: 'Quote from Anonymous',
			body: 'test',
		}

		await transporter.sendMail(mailOptions)
		res.json({ message: 'Email sent successfully.' })
	} catch (e) {
		console.log('Error sending email: ', e)
	}
}

module.exports = { triggerInvoices, sendEmail }
