const express = require('express')
const axios = require('axios')
const app = express()
const path = require('path')
const OAuthClient = require('intuit-oauth')
const bodyParser = require('body-parser')
const token = require('../helpers/intuittoken.json')
const awsHelper = require('../helpers/aws.helper')
const { v1: uuidv1, v4: uuidv4 } = require('uuid')
const config = require('../config/config')
var popsicle = require('popsicle')
const aws = require('aws-sdk')
const _ = require('lodash')

const intuit_token_data = require('../../intuit.json')
const s3 = new aws.S3({
	accessKeyId: config.AWS_ACCESS_KEY,
	secretAccessKey: config.AWS_SECRET_KEY,
})

const userService = require('../dbService/user.service')
const courseService = require('../dbService/course.services')

let oauthClient = null

const getToken = async () => {
	oauthClient = new OAuthClient({
		clientId: process.env.INTUIT_CLIENT_ID,
		clientSecret: process.env.INTUIT_CLIENT_SECRET,
		environment: process.env.INTUIT_ENV,
		redirectUri: process.env.INTUIT_REDIRECT_URL,
	})

	const authUri = oauthClient.authorizeUri({
		scope: [OAuthClient.scopes.Accounting],
		state: 'intuit-test',
	})
	console.log('authUri---->', authUri)

	oauthClient
		.refreshUsingToken(token.refresh_token)
		.then(function (authResponse) {
			console.log(
				'Tokens refreshed : ' + JSON.stringify(authResponse.getJson())
			)
		})
		.catch(function (e) {
			console.error('The error message is :' + e.originalMessage)
			console.error(e.intuit_tid)
		})
}

const createCustomer = async (user_id, course_id, amount) => {
	//const amount = 400
	let address = ''
	let country = ''
	let city = ''
	const courseDetails = await courseService.courseDetails(course_id, 'id')
	const userObj = await userService.userDetails(user_id)
	const addressList = await userService.addressList(user_id)
	if (addressList.length > 0) {
		addressList.map((a) => {
			address = a.address_line_1 + ' ' + a.address_line_2
			city = a.state
			country = a.country
			return
		})
	} else {
		address =
			userObj.dataValues.address_line1 +
			' ' +
			userObj.dataValues.address_line2
		city = userObj.dataValues.state
		country = userObj.dataValues.country
	}
	const DisplayName = userObj.dataValues.name
	const PostalCode = '128324'
	const Notes = `Paid $${parseFloat(amount).toFixed(2)} for course - ${
		courseDetails.name
	}`
	const mobileNo = userObj.dataValues.phone_number
	const email = userObj.dataValues.email
	const baseURL = `${process.env.INTUIT_BASE_URL}/v3/company/${process.env.INTUIT_COMPANY_ID}`
	let customerId = 0
	oauthClient = new OAuthClient({
		clientId: process.env.INTUIT_CLIENT_ID,
		clientSecret: process.env.INTUIT_CLIENT_SECRET,
		environment: process.env.INTUIT_ENV,
		redirectUri: process.env.INTUIT_REDIRECT_URL,
	})

	const resp = await oauthClient.refreshUsingToken(
		intuit_token_data.refresh_token
	)
	const token = resp.getJson()
	var fs = require('fs')
	const token_data = JSON.stringify(resp.getJson(), null, 2)
	fs.writeFile('intuit.json', token_data, 'utf8', function (err) {
		if (err) {
			console.log('An error occured while writing JSON Object to File.')
			return console.log(err)
		}

		console.log('JSON file has been saved.')
	})

	let config = {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token.access_token}`,
		},
	}
	let qdata =
		"Select * from Customer where FullyQualifiedName = '" +
		DisplayName +
		"'"
	config.data = qdata
	config.headers['Content-Type'] = 'application/text'

	config.url = `${baseURL}/query?minorversion=14`

	const oQueryResp = await axios.request(config)
	config.headers['Content-Type'] = 'application/json'

	if (!_.isEmpty(oQueryResp.data.QueryResponse)) {
		customerId = oQueryResp.data.QueryResponse.Customer[0].Id
	} else {
		config.data = JSON.stringify({
			BillAddr: {
				Line1: address,
				City: city,
				Country: country,
				PostalCode,
			},
			Notes,
			DisplayName,
			PrimaryPhone: {
				FreeFormNumber: mobileNo,
			},
			PrimaryEmailAddr: {
				Address: email,
			},
		})
		config.url = `${baseURL}/customer?minorversion=14`

		const oResp = await axios.request(config)
		customerId = oResp.data.Customer.Id
	}
	console.log('customer.Id--------->', customerId)
	config.data = JSON.stringify({
		Line: [
			{
				Amount: amount,
				DetailType: 'SalesItemLineDetail',
				SalesItemLineDetail: {
					ItemRef: {
						name: 'Paid for course.',
					},
					TaxCodeRef: {
						value: '22',
						name: 'ES',
					},
				},
				Description: Notes,
			},
		],
		CustomerRef: {
			value: customerId,
		},
		BillEmail: {
			Address: email,
		},
	})

	config.url = `${baseURL}/invoice?minorversion=14`
	const oResp2 = await axios.request(config)
	const invoideId = oResp2.data.Invoice.Id
	console.log('Invoice id------>', invoideId)
	config.data = JSON.stringify({
		CustomerRef: {
			value: customerId,
		},
		TotalAmt: amount,
		Line: [
			{
				Amount: amount,
				LinkedTxn: [
					{
						TxnId: invoideId,
						TxnType: 'Invoice',
					},
				],
			},
		],
	})
	config.url = `${baseURL}/payment?minorversion=14`

	const oResp3 = await axios.request(config)

	let pdfconfig = {
		method: 'get',
		url: `${baseURL}/invoice/${invoideId}/pdf?minorversion=14`,
		headers: {
			Authorization: `Bearer ${token.access_token}`,
			'Content-Type': 'application/pdf',
			encoding: null,
		},
		responseType: 'arraybuffer',
		responseEncoding: 'binary',
	}
	try {
		const oResp4 = await axios.request(pdfconfig)

		const uploadV = await awsHelper.fileUpload(
			oResp4.data,
			`invoices`,
			`${uuidv4()}.pdf`,
			'application/pdf',
			'mundocrypto-files'
		)
		console.log('Uploaded Invoice file------->', uploadV.data.Location)

		await courseService.addCourseInvoice({
			user_id,
			course_id,
			amount,
			invoice_pdf_url: uploadV.data.Location,
		})
	} catch (error) {
		console.log('pdferror--------->', error)
	}
}

const downloadPDF = async () => {
	const invoideId = 174

	oauthClient = new OAuthClient({
		clientId: 'ABEVwAOROSisJBNLzhvurOrLGLE5jEkl1bP1BZVxYWSFT6Ows8',
		clientSecret: 'fDfrvIvm7iPZWyUvE9L7JehKtlxIPG5J5OG3fNai',
		environment: 'sandbox',
		redirectUri: 'http://localhost:4000/api/intuit/callback',
	})
	const resp = await oauthClient.refreshUsingToken(
		'AB11707779830qF3nSRwVVi0t7Ikyr5BSAwUbKtjiEbQ6oYlmZ'
	)
	const token = resp.getJson()

	let pdfconfig = {
		method: 'get',
		url: `https://sandbox-quickbooks.api.intuit.com/v3/company/4620816365355684890}/invoice/${invoideId}/pdf?minorversion=14`,
		headers: {
			Authorization: `Bearer ${token.access_token}`,
			'Content-Type': 'application/pdf',
			encoding: null,
		},
		responseType: 'arraybuffer',
		responseEncoding: 'binary',
	}
	const oResp4 = await axios.request(pdfconfig)

	const uploadV = await awsHelper.fileUpload(
		oResp4.data,
		`invoices`,
		`${uuidv4()}.pdf`,
		'application/pdf',
		'mundocrypto-files'
	)
	console.log('uploadV.data.Key------->', uploadV.data.Location)

	//	fs.writeFileSync('test4.pdf', JSON.stringify(oResp4.data), 'binary')
}

//getToken()
//createCustomer()
module.exports = { createCustomer, getToken }
//downloadPDF()
