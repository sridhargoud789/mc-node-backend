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
const quickBookService = require('../dbService/quickbook.service')

const getCoursesAssigned = async (req, res, next) => {
	const { user_id } = req.params
	const list = await db.sequelize.query(
		`select c.name , cu.created_at as purchased_date,
		cu.is_partial_payment,cu.remian_payments,cu.payment_devied_in ,cu.next_payment_date,
		huc.started_at,huc.completed_at,huc.progress
		from courses_users cu 
		join courses c on c.id = cu.course_id
		join history_user_courses huc on huc.user_id = cu.user_id and huc.course_id =  cu.course_id
		join users u on u.id = cu.user_id
		where cu.status = 1 and cu.user_id = ${user_id};`
	)
	return response.helper(res, true, 'USERS', list[0], 200)
}

const getAllUsers = async (req, res, next) => {
	try {
		const { from, to, course_id } = req.body
		let query = `select u.id as id,u.name as n,u.email as e,u.phone_number as p,
		date_format(u.created_at , '%Y-%m-%d %H:%i:%s') as uco,
		(select count(*) from courses_users cu where cu.status = 1 and cu.user_id = u.id) as cn
		from users u 
		where cast(u.created_at as date) between '${from}' and '${to}'`

		if (course_id !== 0) {
			query =
				query +
				` AND u.id in (select user_id from courses_users where course_id = ${course_id} and status = 1)`
		}
		query = query + ` order by u.created_at desc;`
		const list = await db.sequelize.query(query)
		return response.helper(res, true, 'USERS', list[0], 200)
	} catch (err) {
		logger.error(`admin panel error ${err}`)
		next(err)
	}
}
const getStats = async (req, res, next) => {
	try {
		//const { courseId } = req.params
		const { from, to } = req.body
		const revenue = await db.sequelize.query(
			`select sum(c.price)/1000000 as revenure
		from courses_users cu
		join  users u on u.id  = cu.user_id
		join courses c on c.id = cu.course_id		
		where 
		cast(cu.created_at as date) between '${from}' and '${to}' and
		cu.status = 1 and email not like '%sridhar%' and email not like '%test%';`
		)
		const totalUsers = await db.sequelize.query(
			`select count(*) TotalUsers
		from users u 
		where 
		cast(u.created_at as date) between '${from}' and '${to}' and
		email not like '%sridhar%' and email not like '%test%';`
		)
		const totalEnrolledUsers = await db.sequelize.query(
			`select count(*) as totalEnrolledUsers
		from courses_users cu
		join  users u on u.id  = cu.user_id
		where 
		cast(cu.created_at as date) between '${from}' and '${to}' and
		cu.status = 1 and email not like '%sridhar%' and email not like '%test%';`
		)
		const totalCourses = await db.sequelize.query(
			`select count(*) as totalCourses from courses where is_published = 1;`
		)
		const assignedUsersCount = await db.sequelize.query(
			`select c.name,count(*) as Count
			from courses_users cu
			join  users u on u.id  = cu.user_id
			join courses c on c.id = cu.course_id
			where 
			cast(cu.created_at as date) between '${from}' and '${to}' and
			cu.status = 1 and email not like '%sridhar%' and email not like '%test%'
			group by c.name;`
		)
		const stats = {
			TotalRevenue: revenue[0][0].revenure,
			TotalUsers: totalUsers[0][0].TotalUsers,
			TotalEnrolledUsers: totalEnrolledUsers[0][0].totalEnrolledUsers,
			TotalCourses: totalCourses[0][0].totalCourses,
			assignedUsersCount: assignedUsersCount[0],
		}

		return response.helper(res, true, '_SUCCESS', stats, 200)
	} catch (err) {
		logger.error(`admin panel error ${err}`)
		next(err)
	}
}

const getGoogleSheetsData = async (req, res, next) => {
	try {
		const PurchasedSalesAgentGS =
			await addDataToSheet.getPurchasedSalesAgentGS()
		const PendingPaymentsGS = await addDataToSheet.getPendingPaymentsGS()
		const getPurchasedGS = await addDataToSheet.getPurchasedGS()

		const stats = {
			PurchasedSalesAgentGS,
			PendingPaymentsGS,
			getPurchasedGS,
		}
		return response.helper(res, true, '_SUCCESS', stats, 200)
	} catch (err) {
		logger.error(`admin panel error ${err}`)
		next(err)
	}
}

module.exports = {
	getAllUsers,
	getStats,
	getGoogleSheetsData,
	getCoursesAssigned,
}
