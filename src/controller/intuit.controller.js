const fs = require('fs')
const csvWriter = require('csv-write-stream')
const config = require('../config/config')
const logger = require('../config/logger')
const dbObj = require('../../models/index')

const db = require('../../models')
const { usersCourseData } = require('../dbService/admin.services')
const awsHelper = require('../helpers/aws.helper')
const response = require('../helpers/response.helper')
const commonService = require('../dbService/common.service')
const commonHelper = require('../helpers/common.helper')
const userService = require('../dbService/user.service')
const courseService = require('../dbService/course.services')
const paymentService = require('../dbService/payment.service')
const adminService = require('../dbService/admin.services')
const moduleService = require('../dbService/module.services')
const mailHelper = require('../helpers/email.helper')
const moment = require('moment')
const activeCampagineHelper = require('../helpers/activecampaign')
const env = config.NODE_ENV || 'development'
const courseUserModel = dbObj.courses_users
const accountSid = 'AC6d9cd24c093a42df79c8c9911e490edb'
const authToken = '62b83d76f6b8fba0f843975182d500f5'
const client = require('twilio')(accountSid, authToken)
const coinbaseCommerceHelper = require('../helpers/coinbase.helper')
const addDataToSheet = require('../helpers/addDataToSheet.helper')

const OAuthClient = require('intuit-oauth')

let oauth2_token_json = null
let redirectUri = ''

let oauthClient = null

const callback = async (req, res, next) => {
	try {
		oauthClient = new OAuthClient({
			clientId: process.env.INTUIT_CLIENT_ID,
			clientSecret: process.env.INTUIT_CLIENT_SECRET,
			environment: process.env.INTUIT_ENV,
			redirectUri: process.env.INTUIT_REDIRECT_URL,
		})

		// const authUri = oauthClient.authorizeUri({
		// 	scope: [OAuthClient.scopes.Accounting],
		// 	state: 'intuit-test',
		// })

		oauthClient
			.createToken(req.url)
			.then(function (authResponse) {
				const access_token = JSON.stringify(
					authResponse.getJson(),
					null,
					2
				)
				const refresh_token = JSON.stringify(
					authResponse.getJson(),
					null,
					3
				)
				console.log('access_token------->', access_token)
				var fs = require('fs')

				fs.writeFile(
					'intuit.json',
					refresh_token,
					'utf8',
					function (err) {
						if (err) {
							console.log(
								'An error occured while writing JSON Object to File.'
							)
							return console.log(err)
						}

						console.log('JSON file has been saved.')
					}
				)
			})
			.catch(function (e) {
				console.error(e)
			})

		return response.helper(
			res,
			true,
			'DATA_FOUND',
			{ oauth2_token_json },
			200
		)
	} catch (error) {
		next(error)
	}
}

module.exports = { callback }
