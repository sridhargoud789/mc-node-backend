const cron = require('node-cron')
const logger = require('../config/logger.js')
const db = require('../../models/index.js')
const moment = require('moment')
const _ = require('lodash')
const dbObj = require('../../models/index')
const addDataToSheet = require('../helpers/addDataToSheet.helper.js')
const commonHelper = require('../helpers/common.helper.js')
cron.schedule('30 5 13 * * *', async () => {
	console.log('running a task every 10 second')
})

const runTask = async () => {
	try {
		const query = `select u.name,u.email,hue.is_passed,hue.percentage
						from  history_user_exams hue
						join users u on hue.user_id = u.id 
						where exam_id=51 ;
        `
		const list = await db.sequelize.query(query)
		if (list[0].length > 0) {
			list[0].map(async (d) => {
				const { name, email, is_passed, percentage } = d
				const username = name === null ? '' : name
				await commonHelper.notify_examresult_email(
					email,
					username,
					is_passed,
					percentage
				)
			})
		}
	} catch (error) {
		console.log(error)
		logger.error('Pending paymnets pushing to GS error:--->', error)
	}
}
module.exports = { runTask }
