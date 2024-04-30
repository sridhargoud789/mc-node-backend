const response = require('../helpers/response.helper')
const responseMessage = require('../config/messages/en')
const constants = require('../config/constants')
const courseService = require('../dbService/course.services')
const courseArticleService = require('../dbService/course_article.service')
const userService = require('../dbService/user.service')
const awsHelper = require('../helpers/aws.helper')
const config = require('../config/config')
const stripeHelper = require('../helpers/stripe.helper')
const logger = require('../config/logger')
const examService = require('../dbService/exam.services')
const { getVideoDurationInSeconds } = require('get-video-duration')
const fs = require('fs')
const csv = require('csv-parser')
const moment = require('moment')
const _ = require('lodash')

const getAllCourseArticles = async (req, res, next) => {
	try {
		const data = await courseArticleService.getAllCourseArticles()

		return response.helper(res, true, '_SUCCESS', { list: data }, 200)
	} catch (err) {
		next(err)
	}
}

const getArticleDetailsById = async (req, res, next) => {
	try {
		const { article_id } = req.body
		const data = await courseArticleService.getArticleDetailsById(
			article_id
		)
		const modules = await courseArticleService.getAllArticlesModules(
			article_id
		)
		const obj = { ...data[0].dataValues, modules }

		return response.helper(res, true, '_SUCCESS', obj, 200)
	} catch (err) {
		next(err)
	}
}

const getPublishedCourseArticles = async (req, res, next) => {
	try {
		const { page, limit,tags,level,duration } = req.body
		const data = await courseArticleService.getPublishedCourseArticles(
			page,
			limit,
			tags,
			level,
			duration
		)

		return response.helper(res, true, '_SUCCESS', { list: data }, 200)
	} catch (err) {
		next(err)
	}
}

const addCourseArticle = async (req, res, next) => {
	try {
		const data = await courseArticleService.addCourseArticle(
			req.body,
			req.user.id
		)

		return response.helper(res, true, '_SUCCESS', { list: data }, 200)
	} catch (err) {
		next(err)
	}
}
const updateCourseArticle = async (req, res, next) => {
	try {
		const obj = _.omit(req.body, ['id'])
		const data = await courseArticleService.updateCourseArticle(
			req.body.id,
			obj
		)

		return response.helper(res, true, '_SUCCESS', { list: data }, 200)
	} catch (err) {
		next(err)
	}
}

const getAllArticlesModules = async (req, res, next) => {
	try {
		const { article_id } = req.body
		const data = await courseArticleService.getAllArticlesModules(
			article_id
		)

		return response.helper(res, true, '_SUCCESS', { list: data }, 200)
	} catch (err) {
		next(err)
	}
}

const addArticleModule = async (req, res, next) => {
	try {
		const data = await courseArticleService.addArticleModule(
			req.body,
			req.user.id
		)

		return response.helper(res, true, '_SUCCESS', { list: data }, 200)
	} catch (err) {
		next(err)
	}
}
const updateArticleModule = async (req, res, next) => {
	try {
		const obj = _.omit(req.body, ['id'])
		const data = await courseArticleService.updateArticleModule(
			req.body.id,
			obj
		)

		return response.helper(res, true, '_SUCCESS', { list: data }, 200)
	} catch (err) {
		next(err)
	}
}

const getArticleDetailsBySlugEN = async (req, res, next) => {
	try {
		const adata = await courseArticleService.getArticleDetailsBySlugEN(
			req.body.slug
		)
		const obj = []
		for (const a of adata) {
			const modules = await courseArticleService.getAllArticlesModules(
				a.id
			)
			const data = a.dataValues
			obj.push({ ...data, modules })
		}
		return response.helper(res, true, '_SUCCESS', { list: obj }, 200)
	} catch (err) {
		next(err)
	}
}
const getArticleDetailsBySlugES = async (req, res, next) => {
	try {
		const adata = await courseArticleService.getArticleDetailsBySlugES(
			req.body.slug
		)
		const obj = []
		for (const a of adata) {
			const modules = await courseArticleService.getAllArticlesModules(
				a.id
			)
			const data = a.dataValues
			obj.push({ ...data, modules })
		}
		return response.helper(res, true, '_SUCCESS', { list: obj }, 200)
	} catch (err) {
		next(err)
	}
}

const getAllArticleTags = async (req, res, next) => {
	try {
		const data = await courseArticleService.getAllArticleTags()

		return response.helper(res, true, '_SUCCESS', data, 200)
	} catch (err) {
		next(err)
	}
}
module.exports = {
	getAllCourseArticles,
	getPublishedCourseArticles,
	addCourseArticle,
	updateCourseArticle,
	getAllArticlesModules,
	addArticleModule,
	updateArticleModule,
	getArticleDetailsBySlugEN,
	getArticleDetailsBySlugES,
	getArticleDetailsById,
	getAllArticleTags,
}
