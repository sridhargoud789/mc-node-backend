const db = require('../../models')

const dbObj = require('../../models/index')
const sequelize = require('sequelize')
const { Op } = require('sequelize')
const moment = require('moment')
const awsHelper = require('../helpers/aws.helper')
const config = require('../config/config')
const _ = require('lodash')

const courseArticlesModel = dbObj.course_articles
const courseArticleModulesModel = dbObj.course_article_modules
const courseArticleTagsModel = dbObj.course_article_tags

module.exports.getAllCourseArticles = async () => {
	try {
		return await courseArticlesModel.findAll()
	} catch (err) {
		console.log(err)
		return false
	}
}

module.exports.getArticleDetailsById = async (id) => {
	try {
		return await courseArticlesModel.findAll({
			where: { id },
		})
	} catch (err) {
		console.log(err)
		return false
	}
}

module.exports.getArticleDetailsBySlugEN = async (slug_en) => {
	try {
		return await courseArticlesModel.findAll({
			where: { slug_en },
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT name FROM users WHERE `users`.`id` = `course_articles`.`created_by`)'
						),
						'createdBy_username',
					],
				],
			},
		})
	} catch (err) {
		console.log(err)
		return false
	}
}

module.exports.getArticleDetailsBySlugES = async (slug_es) => {
	try {
		return await courseArticlesModel.findAll({
			where: { slug_es },
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT name FROM users WHERE `users`.`id` = `course_articles`.`created_by`)'
						),
						'createdBy_username',
					],
				],
			},
		})
	} catch (err) {
		console.log(err)
		return false
	}
}

module.exports.getPublishedCourseArticles = async (
	page,
	limit,
	tags,
	level,
	duration
) => {
	try {
		let offset = 0
		let strtags = ''
		if (!_.isEmpty(tags) || !_.isEmpty(level) || !_.isEmpty(duration)) {
			let countquery = `select count(*) as count from vw_course_articles where `
			let query = `select distinct  * from vw_course_articles where `
			if (!_.isEmpty(tags)) {
				query = query + ` tag_id in (${tags})`
				countquery = countquery + ` tag_id in (${tags})`
			}
			if (!_.isEmpty(level)) {
				query =
					query +
					`${!_.isEmpty(tags) ? ' and ' : ''} level in (${level})`

				countquery =
					countquery +
					`${!_.isEmpty(tags) ? ' and ' : ''} level in (${level})`
			}
			if (!_.isEmpty(duration)) {
				query =
					query +
					`${
						!_.isEmpty(tags)
							? ' and '
							: !_.isEmpty(level)
							? ' and '
							: ''
					} duration between ${duration}`
				countquery =
					countquery +
					`${
						!_.isEmpty(tags)
							? ' and '
							: !_.isEmpty(level)
							? ' and '
							: ''
					} duration between ${duration}`
			}
			// console.log('countquery------------>', countquery)
			// const countlist = await db.sequelize.query(countquery)
			// let pages = Math.ceil(countlist[0][0].count / limit)
			// offset = limit * (page - 1)
			// console.log('countlist------------>', countlist)
			// query = query + ` limit ${offset} ${limit}`
			// console.log('query------------>', query)

			const list = await db.sequelize.query(query)
			return list[0]
		} else {
			const data = await courseArticlesModel.findAndCountAll({
				where: {
					is_published: 1,
					is_deleted: 0,
				},
			})
			let pages = Math.ceil(data.count / limit)
			offset = limit * (page - 1)
			return await courseArticlesModel.findAll({
				where: {
					is_published: 1,
					is_deleted: 0,
				},
				limit: limit,
				offset: offset,
			})
		}
	} catch (err) {
		console.log(err)
		return false
	}
}

exports.addCourseArticle = async (data, created_by) => {
	const d = { ...data, created_by }
	const newData = await courseArticlesModel.create(d)
	return newData
}

exports.updateCourseArticle = async (id, obj) => {
	try {
		const data = await courseArticlesModel.update(obj, {
			where: {
				id,
			},
		})
		return data
	} catch (err) {
		return false
	}
}

module.exports.getAllArticlesModules = async (article_id) => {
	try {
		return await courseArticleModulesModel.findAll({
			where: {
				article_id,
				is_deleted: 0,
			},
		})
	} catch (err) {
		console.log(err)
		return false
	}
}

exports.addArticleModule = async (data, created_by) => {
	const d = { ...data, created_by }

	const newData = await courseArticleModulesModel.create(d)
	return newData
}

exports.updateArticleModule = async (id, obj) => {
	try {
		const data = await courseArticleModulesModel.update(obj, {
			where: {
				id,
			},
		})
		return data
	} catch (err) {
		return false
	}
}
module.exports.getAllArticleTags = async (id) => {
	try {
		return await courseArticleTagsModel.findAll({
			where: { is_deleted: 0 },
		})
	} catch (err) {
		console.log(err)
		return false
	}
}
