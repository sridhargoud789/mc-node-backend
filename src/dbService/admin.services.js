const { Op } = require('sequelize')
const sequelize = require('sequelize')
const dbObj = require('../../models')
const userModel = dbObj.users
const userCourseModel = dbObj.courses_users
const packageCourses = dbObj.course_packages
const userQueAnswerModel = dbObj.user_que_answers
const userHistoryCoursedModel = dbObj.history_user_courses
const userHistoryExamModel = dbObj.history_user_exams
const examModel = dbObj.course_exams
const salesagents_countsModel = dbObj.salesagents_counts
const vat_ratesModel = dbObj.vat_rates
const referral_codesModel = dbObj.referral_codes
const courseModel = dbObj.courses
const stripeHelper = require('../helpers/stripe.helper')
const salesagents_counts = require('../../models/salesagents_counts')

const usersCourseData = async () => {
	return await userCourseModel.findAll({
		raw: true,
		where: { status: 1 },
		include: [
			{
				model: userModel,
				as: 'users',
				attributes: ['id'],
			},
			{
				model: packageCourses,
				as: 'packageData',
				attributes: ['course_ids'],
			},
		],
		attributes: ['id', 'course_id', 'user_id', 'package_id'],
		order: [['user_id', 'ASC']],
		logging: console.log,
	})
}

const removeCourseFromUser = async (userId, courseId) => {
	await userHistoryCoursedModel.destroy({
		where: {
			user_id: userId,
			course_id: courseId,
		},
	})
	await userCourseModel.destroy({
		where: {
			user_id: userId,
			course_id: courseId,
		},
	})
}

const usersByCourse = async (courseId) => {
	const list = await userHistoryCoursedModel.findAll({
		where: {
			course_id: courseId,
		},
		include: [
			{
				model: userModel,
				as: 'user',
				attributes: ['id', 'email', 'name', 'phone_number'],
			},
		],
	})
	return list
}

const userExamsByCourse = async (courseId, userId) => {
	const list = await userHistoryExamModel.findAll({
		where: {
			user_id: userId,
			exam_id: {
				[Op.in]: sequelize.literal(
					`(select id from course_exams where course_id = ${courseId})`
				),
			},
		},
		include: [
			{
				model: examModel,
				attributes: ['id', 'name', 'duration'],
				as: 'examData',
			},
		],
	})
	return list
}

const updateVatRate = async (id, data) => {
	const resp = await vat_ratesModel.update(data, {
		where: {
			id,
		},
	})
	return await vat_ratesModel.findOne({
		where: {
			id,
		},
	})
}
const getVatRates = async () => {
	const data = await vat_ratesModel.findAll()
	return data
}
const getReferralCodesByCourseId = async (course_id) => {
	const data = await referral_codesModel.findAll({
		where: {
			course_id,
		},
	})
	return data
}
const deactivateCouponCode = async (id) => {
	const data = await referral_codesModel.update(
		{ is_active: 0 },
		{
			where: {
				id,
			},
		}
	)
	return data
}

const getSalesAgentsCount = async (course_id) => {
	const data = await salesagents_countsModel.findOne({
		where: {
			course_id,
		},
	})
	return data
}
const addUpdateSalesAgentsCount = async (course_id, no_agents) => {
	const data = await salesagents_countsModel.findOne({
		where: {
			course_id,
		},
	})
	if (data !== null) {
		const resp = await salesagents_countsModel.update(
			{ no_agents },
			{
				where: {
					course_id,
				},
			}
		)
		return resp
	} else {
		const resp = await salesagents_countsModel.create({
			course_id,
			no_agents,
		})
		return resp
	}
}
const addReferealCode = async (data) => {
	const { course_id, discount_type, discountValue, code } = data
	let amount = 0
	if (discount_type === 1) {
		amount = discountValue
	} else {
		const courseData = await courseModel.findOne({
			where: {
				id: course_id,
			},
		})
		amount =
			discountValue === courseData.price
				? courseData.price
				: (courseData.price * discountValue) / 100
	}

	const discount = await stripeHelper.createCoupon({
		amount,
	})

	const resp = await referral_codesModel.create({
		course_id,
		stripe_discount_id: discount.id,
		code,
		discount_percentage: discountValue,
		is_active: 1,
	})
	return resp
}

module.exports = {
	removeCourseFromUser,
	usersCourseData,
	usersByCourse,
	userExamsByCourse,
	updateVatRate,
	getVatRates,
	getReferralCodesByCourseId,
	addReferealCode,
	deactivateCouponCode,
	getSalesAgentsCount,
	addUpdateSalesAgentsCount,
}
