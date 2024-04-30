const log = require('log-to-file')
const moment = require('moment')
const fs = require('fs')
const constants = require('./constants')

const errorDir = constants.DEFAULT_LOG_DIR

const today = () => {
	return moment().format('YYYY-MM-DD')
}
const customLog = (message, deafaultLog) => {
	const logTypes = Object.values(constants.LOG_TYPE)
	if (!logTypes.includes(deafaultLog)) {
		return new Error('invalid log type')
	}

	const date = today()
	const logDir = errorDir + '/' + deafaultLog
	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir, {
			recursive: true,
		})
	}
	const errorDirPath = logDir + '/' + deafaultLog + '-' + date + '.log'
	log(message, errorDirPath)
	console.log(message)
}

module.exports = {
	info: (error) => {
		customLog(error, 'info')
	},
	error: (error) => {
		customLog(error, 'error')
	},
	cron: (error) => {
		customLog(error, 'cron')
	},
	debug: (error) => {
		customLog(error, 'debug')
	},
	coinaseWebhook: (error) => {
		customLog(error, 'coinaseWebhook')
	},
	stripeWehbook: (error) => {
		customLog(error, 'stripeWehbook')
	},
	coinbaseCommerceChangeLog: (error) => {
		customLog(error, 'coinbaseCommerceChangeLog')
	},
	rewardPointLogger: (error) => {
		customLog(error, 'rewardPointChangeLog')
	},
	rewardCron: (error) => {
		customLog(error, 'rewardCron')
	},
	checkOutData: (error) => {
		customLog(error, 'checkoutData')
	},
	activeCampaignLogger: (error) => {
		customLog(error, 'activeCampaign')
	},
	quickbookLogger: (error) => {
		customLog(error, 'quickbook')
	},
}
