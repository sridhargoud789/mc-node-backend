const logger = require('../config/logger')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT } = require('google-auth-library')
const request = require('request')
const csvParse = require('csv-parser')
const axios = require('axios')

const NEXT_PUBLIC_GOOGLE_PRIVATE_KEY =
	'-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLuMXTPrPYIxuW\nNDlADYalKeLX4eroBy/lo3CPsUCxBPbX0omdWQN8HdMjndFfs+8C4zdA0diysPo4\nJI6BN9mxcys/6RMW5IhI89MKRE4x/Q6mVF6Hq44xA4t/AeTWgc3BrUrwzqPFkYTD\n7lOwFiTxdbZn/7wJQvFh08L6fGbd+eu8PzlyUiICK0jskoL3fK/LxUUQJhUldrge\n8VyaJAoe8SQ17G+6qOssyqPjL4NBuXKzEe5uQmnnNy7r4dS8gIJ7uhqJspHyiNYx\nB0PnNoTDLQIRYvk2HjCOzTQfpprNEJcu2nw2/QcwBo08lDp/OBj3P5VzhbAk9zj6\nPPG2PE4ZAgMBAAECggEAHtnPy4UhWHKTSOnbtEwtaccFZ/VPIkLZtAhOPCnMRtfI\n8eIbnk0j7qCC9aUpVzmOe9Ig70YCxPzGx8hxdDbFrCO+waJFlnVBVkWRCMBTVH/4\nFKQ43zQnB7EmZ4jH44bWEVBxmt9lhGkxwTd5oPRENUoYN3j45tt7u87ae3MUuOSi\nIjtFu+6wrJIjDTZcCWr+g7QVZXpa4voSAY2zlFye2ym5t8rT4/BsvUfAzkNUyOan\nx3YRIaHwJTjoyKOiZjTnGau1ftzCTZVv0Z7K03Eew0NNuoPRjpIhbf5WRXWQXqa9\ntwIuTsrMeq6iBsZgHi1YsM0DnhA5q1E+kkvwOYpbqQKBgQDyoxNzd0mhjtmwNS8z\noGRa+qLLNKpJwyauvLBk8AXqeeoBSNfiVZFg3fher2YwnilGIUk7cjP9rfkKy9oy\nIekHTUNY+fOtsb+bd39FByKvAob1ROEezei41FpIe7MrVQUzgV6x4t7+ujENL8mz\n1PEPta+YzOo1iBlriCrAlgQ0+wKBgQDW8Qh81MuK8Sgp1bPtjRTtnyWlaNNdiOBS\naJtSTdrWevfX7byi4zfRNynzmxkEdX3k6OvQ0+j1OvPNPorVKjK2SYtTu1TdNgK/\nujQMpLexQJY0Mzb2OHIiywPPFTE1aLGq0ynDzaYXUGLnT7DzDkmKp18jjiQk5sT0\n9QY1uw5U+wKBgEJ7Zmf75mPrBUCfwfguWXEIPbTaEFK3sxCryNVPYv+VOgXyFJ0C\nfxwAlf4zpxdpLrv1gOBV8WLv2U4Y/wc/fV8vz2VAz4DnNC3/9xJN2zYCxkHMBrbv\nCnYiUT6NDlGwMQWky/KHzDwVfj0zu9uXXBnG2X9PnljemsB5BeXQ9QQjAoGBAKIl\nHHEHGjFLcS/1/ZDjj/kdyIl6hZCW9BpWvW0ePEr2YsdqmZYLcI0MX0JdK0c41ur7\nZwGXCrMMcOTRHGxoM+9dlZRpykBCQVqfPiqXi9dUULs6M2kU9c0Xd10dsIyI2RZz\ny5rhJT2LL8EtVeBVU9ccIeIxlUSdLdFYkgGwhcRHAoGBAJunwAkt8Hwp6MOVxrhv\ngQ6iHGJDTGrT8UeYcI7lYytTIuRel/axISQIQ/inYbK65oMsi31dU73hhIxeG/no\nfz6hCpgn+C5eqsPBaF0+izc0gx/nIGT6u3jZzPDUsEnDq/zkPoOjbkbshtnGMSzf\nKGKMqNPp4p+knMtWc4K+3Rgj\n-----END PRIVATE KEY-----\n'
const NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL =
	'mundonodejs@steam-talent-385412.iam.gserviceaccount.com'

const serviceAccountAuth = new JWT({
	email: NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
	key: NEXT_PUBLIC_GOOGLE_PRIVATE_KEY,
	scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

module.exports.addPurchasedDataToGoogleSheet = async (data) => {
	try {
		const NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID =
			'18TgwtVcmd4Lw57EPmVc7njYhyItjM-v2LF4TxaSn69E'

		const doc = new GoogleSpreadsheet(
			NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID,
			serviceAccountAuth
		)

		const req = [data]
		await doc.loadInfo()
		const sheet = doc.sheetsByIndex[0]
		await sheet.addRows(req)
	} catch (error) {
		console.log(error)
		logger.error(error)
	}
}
module.exports.addPurchasedSalesAgentToGS = async (data) => {
	try {
		const NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID =
			'1Kscfh_9T9o31zwPfm8PPwjrgkFtzfMuPmnCdXtb1sZ4'

		const doc = new GoogleSpreadsheet(
			NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID,
			serviceAccountAuth
		)
		if (data.sales_agent) {
			const req = [data]
			await doc.loadInfo()
			const sheet = doc.sheetsByIndex[0]
			await sheet.addRows(req)
		}
	} catch (error) {
		console.log(error)
		logger.error(error)
	}
}

module.exports.addPendingPaymentsToGS = async (req) => {
	try {
		const NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID =
			'1Vt9lxj0Oo6-RGfSgu2scxBDmURAjipLgooOu0inigK8'

		const doc = new GoogleSpreadsheet(
			NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID,
			serviceAccountAuth
		)

		//	const req = [data]
		await doc.loadInfo()
		const sheet = doc.sheetsByIndex[0]
		await sheet.addRows(req)
	} catch (error) {
		console.log(error)
		logger.error(error)
	}
}

module.exports.getPurchasedSalesAgentGS = async (data) => {
	try {
		const NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID =
			'1Kscfh_9T9o31zwPfm8PPwjrgkFtzfMuPmnCdXtb1sZ4'

		const doc = new GoogleSpreadsheet(
			NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID,
			serviceAccountAuth
		)
		await doc.loadInfo()

		const sheet = await doc.sheetsByIndex[0] // It seems that in your script, the ID is searched from the 2nd tab in Spreadsheet.
		const rows = await sheet.getRows()
		const respData = []
		rows.forEach((row) => {
			const _r = row._rawData
			respData.push({
				course_name: _r[0],
				name: _r[1],
				email: _r[2],
				phone: _r[3],
				payment_date: _r[4],
				payment_amount: _r[5],
				sales_agent: _r[6],
			})
		})
		return respData
	} catch (error) {
		console.log(error)
		logger.error(error)
	}
}

module.exports.getPendingPaymentsGS = async (data) => {
	try {
		const NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID =
			'1Vt9lxj0Oo6-RGfSgu2scxBDmURAjipLgooOu0inigK8'

		const doc = new GoogleSpreadsheet(
			NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID,
			serviceAccountAuth
		)
		await doc.loadInfo()

		const sheet = await doc.sheetsByIndex[0] // It seems that in your script, the ID is searched from the 2nd tab in Spreadsheet.
		const rows = await sheet.getRows()
		const respData = []
		rows.forEach((row) => {
			const _r = row._rawData
			respData.push({
				course_name: _r[0],
				name: _r[1],
				email: _r[2],
				phone: _r[3],
				amount_to_pay: _r[4],
				payment_date: _r[5],
				payment_divided_in: _r[6],
				remaining_payments: _r[7],
				payment_details: _r[8],
				sales_agent: _r[9],
			})
		})
		return respData
	} catch (error) {
		console.log(error)
		logger.error(error)
	}
}
module.exports.getPurchasedGS = async (data) => {
	try {
		const NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID =
			'18TgwtVcmd4Lw57EPmVc7njYhyItjM-v2LF4TxaSn69E'

		const doc = new GoogleSpreadsheet(
			NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID,
			serviceAccountAuth
		)
		await doc.loadInfo()

		const sheet = await doc.sheetsByIndex[0] // It seems that in your script, the ID is searched from the 2nd tab in Spreadsheet.
		const rows = await sheet.getRows()
		const respData = []
		rows.forEach((row) => {
			const _r = row._rawData
			respData.push({
				course_name: _r[0],
				name: _r[1],
				email: _r[2],
				phone: _r[3],
				payment_date: _r[4],
				payment_amount: _r[5],
				payment_divided_in: _r[6],
				payment_method: _r[7],
				merchant: _r[8],
			})
		})
		return respData
	} catch (error) {
		console.log(error)
		logger.error(error)
	}
}
