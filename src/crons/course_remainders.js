const cron = require('node-cron')
const logger = require('../config/logger.js')
const axios = require('axios')

const mailHelper = require('../helpers/email.helper.js')
const {
	getUserCourseRemainders,
	first_remainder_sent,
	second_remainder_sent,
	third_remainder_sent,
	fourth_remainder_sent,
} = require('../dbService/course.services.js')
const _ = require('lodash')
cron.schedule('*/10 * * * * *', async () => {
	console.log('running a task every 10 second')

	const data = await getUserCourseRemainders()
	for (const d of data) {
		const {
			progress,
			courseName,
			id,
			userName,
			email,
			is_first_remainder_sent,
			is_second_remainder_sent,
			is_third_remainder_sent,
			is_fourth_remainder_sent,
		} = d.dataValues
		
		if (progress === 0 && is_first_remainder_sent !== 1) {
			console.log('sending first-alarm to -->', email)
			await mailHelper.sendEmail({
				type: 'first-alarm',
				data: {
					name: userName,
					email: email,
					course_name: courseName,
				},
			})
			await first_remainder_sent(d.id)
		} else if (progress === 25 && is_second_remainder_sent !== 1) {
			console.log('sending progress-update to -->', email)
			await mailHelper.sendEmail({
				type: 'progress-update',
				data: {
					name: userName,
					email: email,
					course_name: courseName,
				},
			})
			await second_remainder_sent(d.id)
		} else if (progress === 50 && is_third_remainder_sent !== 1) {
			console.log('sending midway-remainder to -->', email)
			await mailHelper.sendEmail({
				type: 'midway-remainder',
				data: {
					name: userName,
					email: email,
					course_name: courseName,
				},
			})
			await third_remainder_sent(d.id)
		} else if (progress === 90 && is_fourth_remainder_sent !== 1) {
			console.log('sending final-stretch to -->', email)
			await mailHelper.sendEmail({
				type: 'final-stretch',
				data: {
					name: userName,
					email: email,
					course_name: courseName,
				},
			})
			await fourth_remainder_sent(d.id)
		}
	}
})
