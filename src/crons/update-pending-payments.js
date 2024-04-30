const cron = require('node-cron')
const logger = require('../config/logger.js')
const db = require('../../models/index.js')

const _ = require('lodash')
const dbObj = require('../../models/index')
const addDataToSheet = require('../helpers/addDataToSheet.helper.js')
cron.schedule('0 5 * * *', async () => {
	console.log('running update payments in google sheet')
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
							cu.is_partial_payment = 1
							AND cu.remian_payments <> 0
							AND cu.each_payment_amount IS NOT NULL
							AND cu.next_payment_date IS NOT NULL
							AND cu.next_payment_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) 
        `
		const list = await db.sequelize.query(query)
		if (list[0].length > 0) {
			await addDataToSheet.addPendingPaymentsToGS(list[0])
			logger.cron(
				'Pushed pending paymnets with records:--->',
				list[0].length
			)
		}
	} catch (error) {
		logger.cron('Pending paymnets pushing to GS error:--->', error)
	}
})
