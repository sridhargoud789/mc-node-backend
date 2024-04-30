const cron = require('node-cron')
const logger = require('../config/logger.js')
const db = require('../../models/index.js')
const moment = require('moment')
const _ = require('lodash')
const dbObj = require('../../models/index')
const addDataToSheet = require('../helpers/addDataToSheet.helper.js')
const commonHelper = require('../helpers/common.helper')
cron.schedule('0 5 * * *', async () => {
	console.log('Running payment remainders')
	try {
		const query = `SELECT 
						c.name AS course_name,
						u.name,
						u.email,
						u.phone_number,
						cu.each_payment_amount AS amount_to_pay,
						cu.next_payment_date AS payment_date,
						cu.payment_devied_in AS payment_divided_in,
						(CASE
							WHEN cu.remian_payments IS NULL THEN ''
							ELSE cu.remian_payments
						END) AS remaining_payments,
						(CASE
							WHEN cu.payment_details IS NULL THEN ''
							ELSE cu.payment_details
						END) AS payment_details,
						(CASE
							WHEN cu.sales_agent IS NULL THEN ''
							ELSE cu.sales_agent
						END) AS sales_agent
					FROM
						courses_users cu
							JOIN
						courses c ON cu.course_id = c.id
							JOIN
						users u ON u.id = cu.user_id
					WHERE
							cu.course_id = 55
							AND cu.is_partial_payment = 1
							AND cu.remian_payments <> 0
							AND cu.each_payment_amount IS NOT NULL
							AND cu.next_payment_date IS NOT NULL
        `
		const list = await db.sequelize.query(query)
		if (list[0].length > 0) {
			list[0].map(async (d) => {
				const {
					course_name,
					payment_date,
					name,
					email,
					phone_number,
					amount_to_pay,
					payment_divided_in,
					remaining_payments,
					payment_details,
				} = d
				var date1 = moment()
				var date2 = moment(payment_date)
				var days = date2.diff(date1, 'days') + 1

				if (days <= 5 && days > 0) {
					const username = name === null ? '' : name
					const strAmount = `$${amount_to_pay}`
					await commonHelper.payment_remainder_mail(
						email,
						username,
						days,
						payment_date,
						strAmount
					)

					if (days === 2) {
						const phno =
							phone_number.indexOf('+') === -1
								? '+' + phone_number
								: phone_number
						await commonHelper.payment_remainder_whatsapp(
							username,
							strAmount,
							phno
						)
					}
				}
			})
		}
	} catch (error) {
		console.log(error)
		logger.cron('Pending payment remainders:--->', error)
	}
})
