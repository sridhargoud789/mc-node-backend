const express = require('express')
const { connectToDatabase } = require('./helpers/connectToDatabase.helper')
const router = require('./routes/index')
const logger = require('./config/logger')
const config = require('./config/config')
const apiLog = require('morgan')
const errorHandler = require('./middleware/errorHandler')
const http = require('http')
const cors = require('cors')
const crons = require('./crons')
const migration = require('./crons/migration')
const remainders = require('./crons/payment-remainders')
const commonHelper = require('./helpers/common.helper')
const notifyExamResult = require('./crons/notify-exam-results')
const updatePendingPayments = require('./crons/update-pending-payments')
const intuit = require('./crons/intuit')
const test = require('./crons/test')
const quickbook = require('./dbService/quickbook.service')

const app = express()

const PORT = config.PORT

global.projectDir = __dirname
app.use(cors())
app.use(express.json({ limit: '100mb' }))
app.use(
	express.urlencoded({
		extended: true,
		limit: '100mb',
		parameterLimit: 100000,
	})
)
app.use(apiLog('dev'))
/**
 * start server and all process
 */
const startServer = async () => {
	await connectToDatabase()
	await intuit.getToken()
	//await test.triggerInvoices()
	//await test.sendEmail()
	//await quickbook.refreshToken()
	//await intuit.createCustomer(3121, 56, 1)
	//await updatePendingPayments.runTask()
	//await notifyExamResult.runTask()
	//await migration.main();
	//await remainders.runTask()
	// await commonHelper.payment_remainder_whatsapp("Mani Thawani","$560","+971555276812")
	// await commonHelper.payment_remainder_whatsapp("Sevi","$560","+971588163251")
	// await commonHelper.payment_remainder_whatsapp("Sridhar","$560","+971566285608")
	app.use(router)
	app.use(errorHandler)
	await setUpHttp()
}

/**
 * Set up http server
 */
async function setUpHttp() {
	const server = http.createServer(app)
	server.listen(PORT, () => {
		logger.info(`Server start at ${PORT}`)
	})
}

module.exports = {
	startServer,
	express,
}
