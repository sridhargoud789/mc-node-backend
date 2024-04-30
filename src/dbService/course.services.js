const dbObj = require('../../models/index')
const sequelize = require('sequelize')
const { Op } = require('sequelize')
const moment = require('moment')
const awsHelper = require('../helpers/aws.helper')
const config = require('../config/config')
const courseModel = dbObj.courses
const noticeCategoryModel = dbObj.notice_categories
const statusModel = dbObj.statuses
const levelModel = dbObj.levels
const courseCategoryModel = dbObj.course_categories
const languageModel = dbObj.languages
const userModel = dbObj.users
const courseForModel = dbObj.course_for
const cartModel = dbObj.user_cart
const wishListModel = dbObj.user_wishlist
const courseModuleModel = dbObj.course_modules
const courseSubModuleModel = dbObj.course_submodules
const courseLecturesModel = dbObj.course_lectures
const courseDocumentModel = dbObj.lecture_documents
const userHistoryCoursedModel = dbObj.history_user_courses
const courseUserModel = dbObj.courses_users
const courseExamModel = dbObj.course_exams
const questionExamModel = dbObj.exam_questions
const userTransactionModel = dbObj.user_transactions
const packageCourses = dbObj.course_packages
const discountModels = dbObj.discounts
const freeCourseWhiteListedModel = dbObj.free_course_white_list_users
const userHistoryExamModel = dbObj.history_user_exams
const noticeCategoryLangModel = dbObj.notice_categories_multi_languages
const courseMultiLanguageModel = dbObj.courses_multi_language
const courseModuleMultiLanguageModel = dbObj.course_modules_multi_languages
const courseLectureMultiLanguageModel = dbObj.course_lectures_multi_languages
const courseExamMultiLanguageModel = dbObj.course_exams_multi_languages
const courseInvoiceeModel = dbObj.course_invoices
const vat_ratesModel = dbObj.vat_rates

module.exports.courseListData = async (
	status,
	search,
	category,
	page,
	per_page = 10,
	language
) => {
	const whereCond = {
		is_published: 1,
		is_course_restricted_to_users: 0,
	}
	const statusCond = {}
	const categoryCond = {}
	if (status) statusCond.id = status
	if (search && search != '' && search != null) {
		whereCond[Op.or] = [
			{
				name: {
					[Op.like]: `%${search}%`,
				},
			},
			{
				slug: {
					[Op.like]: `%${search}%`,
				},
			},
		]
	}
	if (category) {
		const categorData = await noticeCategoryModel.findOne({
			where: { slug: category },
			attributes: ['id'],
		})
		if (categorData) categoryCond.category_id = categorData.id
		else {
			return []
		}
	}
	let multiLanguageAttributeList = []
	if (language) {
		multiLanguageAttributeList = [
			'name',
			'slug',
			'description',
			'url_image',
			'url_image_mobile',
			'url_image_thumbnail',
			'signed_url_image',
			'signed_url_image_mobile',
			'signed_url_image_thumbnail',
		]
	}
	const data = await courseModel.findAll({
		where: whereCond,
		include: [
			{
				model: courseMultiLanguageModel,
				...(language && {
					where: { language_code: language },
				}),
				attributes: [...multiLanguageAttributeList],
				as: 'courseData',
			},
			{
				model: statusModel,
				as: 'status',
			},
			{
				model: levelModel,
				as: 'levels',
			},
			{
				model: courseCategoryModel,
				as: 'courseCategories',
				where: categoryCond,
				include: [
					{
						model: noticeCategoryModel,
						as: 'category',
						attributes: ['name', 'id', 'slug'],
					},
				],
				require: true,
			},
		],
		attributes: [
			'id',
			'name',
			'slug',
			'description',
			'url_image',
			'url_image_mobile',
			'url_image_thumbnail',
			'signed_url_image',
			'signed_url_image_mobile',
			'signed_url_image_thumbnail',
			'price',
			'duration',
			[
				sequelize.literal(
					'(SELECT COUNT("id") FROM testimonials WHERE `testimonials`.`id` = `courses`.`id`)'
				),
				'total_reviews',
			],
			[
				sequelize.literal(
					'IFNULL((SELECT AVG("star") FROM testimonials WHERE `testimonials`.`id` = `courses`.`id`), 0)'
				),
				'star_avg',
			],
			'is_public',
			'created_at',
			'is_sold_out',
			'custom_field_1',
			'custom_field_2',
			'custom_field_3',
			'custom_field_4',
			'custom_field_5',
			'custom_field_6',
			'custom_field_7',
			'custom_field_8',
			'custom_field_9',
			'custom_field_10',
			'split_payment_amounts',
		],
		logging: console.log,
		order: [['created_at', 'DESC']],
		// offset: (page - 1) * per_page,
		// limit: per_page,
	})
	data.map((eachList) => {
		if (language) {
			eachList.name = eachList.courseData.name
			eachList.slug = eachList.courseData.slug
			eachList.description = eachList.courseData.description
			eachList.url_image = eachList.courseData.url_image
			eachList.url_image_mobile = eachList.courseData.url_image_mobile
			eachList.url_image_thumbnail =
				eachList.courseData.url_image_thumbnail
			eachList.signed_url_image = eachList.courseData.signed_url_image
			eachList.signed_url_image_mobile =
				eachList.courseData.signed_url_image_mobile
			eachList.signed_url_image_thumbnail =
				eachList.courseData.signed_url_image_thumbnail
		}
	})
	return data
}

module.exports.whiteListedCourseList = async (
	email,
	status,
	search,
	category,
	page,
	per_page = 10
) => {
	const whereCond = {
		is_published: 1,
		is_course_restricted_to_users: 1,
		// email: {
		//   [Op.in]: sequelize.literal(`(select email from free_course_white_list_users)`)
		// }
	}
	const statusCond = {}
	const categoryCond = {}
	if (status) statusCond.id = status
	if (search && search != '' && search != null) {
		whereCond[Op.or] = [
			{
				name: {
					[Op.like]: `%${search}%`,
				},
			},
			{
				slug: {
					[Op.like]: `%${search}%`,
				},
			},
		]
	}
	if (category) {
		const categorData = await noticeCategoryModel.findOne({
			where: { slug: category },
			attributes: ['id'],
		})
		if (categorData) categoryCond.category_id = categorData.id
		else {
			return []
		}
	}
	const data = await courseModel.findAll({
		where: whereCond,
		include: [
			{
				model: statusModel,
				as: 'status',
			},
			{
				model: levelModel,
				as: 'levels',
			},
			{
				model: courseCategoryModel,
				as: 'courseCategories',
				where: categoryCond,
				include: [
					{
						model: noticeCategoryModel,
						as: 'category',
						attributes: ['name', 'id', 'slug'],
					},
				],
				require: true,
			},
		],
		attributes: [
			'id',
			'name',
			'slug',
			'description',
			'url_image',
			'url_image_mobile',
			'url_image_thumbnail',
			'signed_url_image',
			'signed_url_image_mobile',
			'signed_url_image_thumbnail',
			'price',
			'duration',
			[
				sequelize.literal(
					'(SELECT COUNT("id") FROM testimonials WHERE `testimonials`.`id` = `courses`.`id`)'
				),
				'total_reviews',
			],
			[
				sequelize.literal(
					'IFNULL((SELECT AVG("star") FROM testimonials WHERE `testimonials`.`id` = `courses`.`id`), 0)'
				),
				'star_avg',
			],
			'is_public',
			'created_at',
			'is_sold_out',
		],

		order: [['created_at', 'DESC']],
	})
	return data
}

module.exports.isEmailWhiteListed = async (email) => {
	return await freeCourseWhiteListedModel.findOne({
		where: {
			email,
		},
	})
}
module.exports.getVateRateByCountryCode = async (code) => {
	return await vat_ratesModel.findOne({
		where: {
			code,
		},
	})
}

module.exports.totalCourse = async () => {
	const data = await courseModel.count()
	return data
}
module.exports.getCoursePublicDetails = async (courseId, isAdmin, language) => {
	const cond = {
		...(!isAdmin && {
			is_published: true,
		}),
		id: courseId,
	}
	const data = await courseModel.findOne({
		logging: console.log,
		where: cond,
		include: [
			{
				required: false,
				model: courseMultiLanguageModel,
				as: 'courseData',
				...(language && {
					where: { language_code: language },
				}),
			},
			{
				model: languageModel,
				as: 'language',
			},
			{
				model: courseForModel,
				as: 'courseFor',
			},
			{
				model: userModel,
				as: 'author',
				attributes: ['id', 'name', 'avatar'],
			},
			{
				model: courseModuleModel,
				as: 'courseModules',
				attributes: [
					'id',
					'module_index',
					'name',
					'description',
					[
						sequelize.literal(
							'(SELECT COUNT("id") FROM course_lectures WHERE `course_lectures`.`module_id` = `courseModules`.`id`)'
						),
						'total_lecture',
					],
				],
				order: [['module_index', 'ASC']],
				include: [
					{
						required: false,
						model: courseModuleMultiLanguageModel,
						...(language && {
							where: {
								language_code: language,
							},
						}),
						as: 'moduleData',
					},
					{
						model: courseLecturesModel,
						as: 'courseLectures',
						attributes: [
							'id',
							'name',
							'duration',
							'lecture_index',
							'course_id',
							'module_id',
							'description',
							'live_stream_url',
							'sub_module_id',
							'video_thumbnail',
						],
						order: [['lecture_index', 'ASC']],
						include: [
							{
								required: false,
								model: courseLectureMultiLanguageModel,
								...(language && {
									where: {
										language_code: language,
									},
								}),
								as: 'lectureData',
							},
							{
								model: courseSubModuleModel,
								as: 'sub_modules',
							},
						],
					},
				],
			},
			{
				model: courseCategoryModel,
				as: 'courseCategories',
				require: true,
				include: [
					{
						model: noticeCategoryModel,
						as: 'category',
						attributes: ['name', 'id', 'slug'],
					},
				],
			},
		],
		attributes: [
			'id',
			'name',
			'sub_title',
			'features_list',
			'learning_points',
			'slug',
			'description',
			'descriptionObj',
			'url_image',
			'url_image_mobile',
			'url_image_thumbnail',
			'signed_url_image',
			'signed_url_image_mobile',
			'signed_url_image_thumbnail',
			'thumbnail_video',
			'duration',
			'price',
			'is_partial_payment_available',
			'split_payment_amounts',
			'split_payment_amounts_obj',
			'is_ready_for_Learning',
			'is_public',
			'is_available_pay_mc_wallet',
			'nft_purchase_price',
			'nft_stripe_id',
			'is_nft_free',
			'brochure_url',
			'Is_NFT_Available',
			'is_sold_out',
			[
				sequelize.literal(
					'(SELECT COUNT("id") FROM course_modules WHERE `course_modules`.`course_id` = ' +
						courseId +
						')'
				),
				'total_modules',
			],
			'custom_field_1',
			'custom_field_2',
			'custom_field_3',
			'custom_field_4',
			'custom_field_5',
			'custom_field_6',
			'custom_field_7',
			'custom_field_8',
			'custom_field_9',
			'custom_field_10',
			'online_text',
			'total_modules',
			'training_type',
			'access_type',
			'launguage',
			'ratings',
			'telegram_link',
			'whatsapp_link',
			'telegram_users_google_link',
		],
	})
	if (language && data?.courseData) {
		data.name = data.courseData.name
		data.sub_title = data.courseData.sub_title
		data.features_list = data.courseData.sub_title
		data.learning_points = data.courseData.learning_points
		data.slug = data.courseData.slug
		data.description = data.courseData.description
		data.url_image = data.courseData.url_image
		data.url_image_mobile = data.courseData.url_image_mobile
		data.url_image_thumbnail = data.courseData.url_image_thumbnail
		data.signed_url_image = data.courseData.signed_url_image
		data.signed_url_image_mobile = data.courseData.signed_url_image_mobile
		data.signed_url_image_thumbnail =
			data.courseData.signed_url_image_thumbnail
		data.courseModules.forEach((eachModle) => {
			eachModle.courseLectures?.forEach((eachLecture) => {
				eachLecture.name = eachLecture.lectureData?.name
				eachLecture.description = eachLecture.lectureData?.description
				eachLecture.duration = eachLecture.lectureData?.duration
				eachLecture = eachLecture
			})
			if (eachModle.moduleData?.name) {
				eachModle.name = eachModle.moduleData?.name
				eachModle.description = eachModle.moduleData?.description
			}
			if (eachModle.examData) {
				eachModle.examData.name = eachModle.examData.examData?.name
				eachModle.examData.instruction =
					eachModle.examData.examData?.instruction
			}
			eachModle = eachModle
		})
	}
	return data
}

module.exports.getCourseAdminDetails = async (courseId, isAdmin, language) => {
	const cond = {
		...(!isAdmin && {
			is_published: true,
		}),
		id: courseId,
	}
	const data = await courseModel.findOne({
		logging: console.log,
		where: cond,
		include: [
			{
				required: false,
				model: courseMultiLanguageModel,
				as: 'courseData',
				...(language && {
					where: { language_code: language },
				}),
			},
			{
				model: languageModel,
				as: 'language',
			},
			{
				model: courseForModel,
				as: 'courseFor',
			},
			{
				model: userModel,
				as: 'author',
				attributes: ['id', 'name', 'avatar'],
			},
			{
				model: courseModuleModel,
				as: 'courseModules',
				attributes: [
					'id',
					'module_index',
					'name',
					'description',
					[
						sequelize.literal(
							'(SELECT COUNT("id") FROM course_lectures WHERE `course_lectures`.`module_id` = `courseModules`.`id`)'
						),
						'total_lecture',
					],
				],
				order: [['module_index', 'ASC']],
				include: [
					{
						required: false,
						model: courseModuleMultiLanguageModel,
						...(language && {
							where: {
								language_code: language,
							},
						}),
						as: 'moduleData',
					},
					{
						model: courseLecturesModel,
						as: 'courseLectures',
						attributes: [
							'id',
							'name',
							'duration',
							'lecture_index',
							'course_id',
							'module_id',
							'description',
							'live_stream_url',
							'signed_video_url',
							'video_url',
							'sub_module_id',
							'video_thumbnail',
						],
						order: [['lecture_index', 'ASC']],
						include: [
							{
								required: false,
								model: courseLectureMultiLanguageModel,
								...(language && {
									where: {
										language_code: language,
									},
								}),
								as: 'lectureData',
							},
							{
								model: courseDocumentModel,
								as: 'documents',
							},
							{
								model: courseSubModuleModel,
								as: 'sub_modules',
							},
						],
					},
					{
						model: courseExamModel,
						as: 'examData',
					},
				],
			},
			{
				model: courseCategoryModel,
				as: 'courseCategories',
				require: true,
				include: [
					{
						model: noticeCategoryModel,
						as: 'category',
						attributes: ['name', 'id', 'slug'],
					},
				],
			},
		],
		attributes: [
			'id',
			'name',
			'sub_title',
			'features_list',
			'learning_points',
			'slug',
			'description',
			'descriptionObj',
			'url_image',
			'url_image_mobile',
			'url_image_thumbnail',
			'signed_url_image',
			'signed_url_image_mobile',
			'signed_url_image_thumbnail',
			'thumbnail_video',
			'mct_amount',
			'reword',
			'is_published',
			'active_campagine_tag',
			'duration',
			'price',
			'is_partial_payment_available',
			'split_payment_amounts',
			'split_payment_amounts_obj',
			'is_ready_for_Learning',
			'is_public',
			'is_available_pay_mc_wallet',
			'nft_purchase_price',
			'nft_stripe_id',
			'is_nft_free',
			'brochure_url',
			'document_url',
			'is_course_restricted_to_users',
			'Is_NFT_Available',
			'active_campagine_list',
			'is_sold_out',
			[
				sequelize.literal(
					'(SELECT COUNT("id") FROM course_modules WHERE `course_modules`.`course_id` = ' +
						courseId +
						')'
				),
				'total_modules',
			],
			'custom_field_1',
			'custom_field_2',
			'custom_field_3',
			'custom_field_4',
			'custom_field_5',
			'custom_field_6',
			'custom_field_7',
			'custom_field_8',
			'custom_field_9',
			'custom_field_10',
		],
	})
	if (language && data?.courseData) {
		data.name = data.courseData.name
		data.sub_title = data.courseData.sub_title
		data.features_list = data.courseData.sub_title
		data.learning_points = data.courseData.learning_points
		data.slug = data.courseData.slug
		data.description = data.courseData.description
		data.url_image = data.courseData.url_image
		data.url_image_mobile = data.courseData.url_image_mobile
		data.url_image_thumbnail = data.courseData.url_image_thumbnail
		data.signed_url_image = data.courseData.signed_url_image
		data.signed_url_image_mobile = data.courseData.signed_url_image_mobile
		data.signed_url_image_thumbnail =
			data.courseData.signed_url_image_thumbnail
		data.courseModules.forEach((eachModle) => {
			eachModle.courseLectures?.forEach((eachLecture) => {
				eachLecture.name = eachLecture.lectureData?.name
				eachLecture.description = eachLecture.lectureData?.description
				eachLecture.duration = eachLecture.lectureData?.duration
				eachLecture = eachLecture
			})
			if (eachModle.moduleData?.name) {
				eachModle.name = eachModle.moduleData?.name
				eachModle.description = eachModle.moduleData?.description
			}
			if (eachModle.examData) {
				eachModle.examData.name = eachModle.examData.examData?.name
				eachModle.examData.instruction =
					eachModle.examData.examData?.instruction
			}
			eachModle = eachModle
		})
	}
	return data
}

module.exports.addToCart = async (courseId, userId) => {
	const data = await cartModel.create({
		course_id: courseId,
		user_id: userId,
	})
	return data
}

module.exports.removeToCart = async (courseId, userId) => {
	const data = await cartModel.destroy({
		where: {
			course_id: courseId,
			user_id: userId,
		},
	})
	return data
}
module.exports.checkInCart = async (courseId, userId) => {
	const data = await cartModel.findOne({
		where: {
			course_id: courseId,
			user_id: userId,
		},
	})
	return data
}
module.exports.cartList = async (userId) => {
	const data = await courseModel.findAll({
		where: {
			id: {
				[Op.in]: sequelize.literal(
					'(SELECT course_id FROM user_cart WHERE `user_cart`.`user_id` = ' +
						userId +
						')'
				),
			},
		},
		include: [
			{
				model: statusModel,
				as: 'status',
			},
			{
				model: levelModel,
				as: 'levels',
			},
			{
				model: courseCategoryModel,
				as: 'courseCategories',
				require: true,
				include: [
					{
						model: noticeCategoryModel,
						as: 'category',
						attributes: ['name', 'id', 'slug'],
					},
				],
			},
		],
		attributes: [
			'id',
			'name',
			'slug',
			'description',
			'url_image',
			'url_image_mobile',
			'url_image_thumbnail',
			'signed_url_image',
			'signed_url_image_mobile',
			'signed_url_image_thumbnail',
			'mct_amount',
			'price',
			[
				sequelize.literal(
					'(SELECT COUNT("id") FROM testimonials WHERE `testimonials`.`id` = `courses`.`id`)'
				),
				'total_reviews',
			],
			[
				sequelize.literal(
					'IFNULL((SELECT AVG("star") FROM testimonials WHERE `testimonials`.`id` = `courses`.`id`), 0)'
				),
				'star_avg',
			],

			'created_at',
		],
		order: [['created_at', 'DESC']],
	})
	// data.forEach(eachD => {
	// 	if(eachD.signed_url_image == 'https://s3.eu-central-1.amazonaws.com/') {
	// 		eachD.signed_url_image = awsHelper.getFileUrlSync(eachD.url_image, config.MS_TUTORIAL_BUCKET)
	// 	}
	// })

	return data
}

module.exports.addToWish = async (courseId, userId) => {
	const data = await wishListModel.create({
		course_id: courseId,
		user_id: userId,
	})
	return data
}

module.exports.removeToWish = async (courseId, userId) => {
	const data = await wishListModel.destroy({
		where: {
			course_id: courseId,
			user_id: userId,
		},
	})
	return data
}
module.exports.checkInWish = async (courseId, userId) => {
	const data = await wishListModel.findOne({
		where: {
			course_id: courseId,
			user_id: userId,
		},
	})
	return data
}
module.exports.wishList = async (userId) => {
	const data = await courseModel.findAll({
		where: {
			id: {
				[Op.in]: sequelize.literal(
					'(SELECT course_id FROM user_wishlist WHERE `user_wishlist`.`user_id` = ' +
						userId +
						')'
				),
			},
		},
		include: [
			{
				model: statusModel,
				as: 'status',
			},
			{
				model: levelModel,
				as: 'levels',
			},
			{
				model: courseCategoryModel,
				as: 'courseCategories',
			},
		],
		attributes: [
			'id',
			'name',
			'slug',
			'description',
			'url_image',
			'url_image_mobile',
			'url_image_thumbnail',
			'signed_url_image',
			'signed_url_image_mobile',
			'signed_url_image_thumbnail',

			'price',
			[
				sequelize.literal(
					'(SELECT COUNT("id") FROM testimonials WHERE `testimonials`.`id` = `courses`.`id`)'
				),
				'total_reviews',
			],
			[
				sequelize.literal(
					'IFNULL((SELECT AVG("star") FROM testimonials WHERE `testimonials`.`id` = `courses`.`id`), 0)'
				),
				'star_avg',
			],

			'created_at',
		],
		order: [['created_at', 'DESC']],
	})
	// data.forEach(eachD => {
	// 	if(eachD.signed_url_image == 'https://s3.eu-central-1.amazonaws.com/') {
	// 		eachD.signed_url_image = awsHelper.getFileUrlSync(eachD.url_image, config.MS_TUTORIAL_BUCKET)
	// 	}
	// })

	return data
}

module.exports.searchCourseList = async (status, search) => {
	const whereCond = {}
	let statusCond = {}
	if (status) statusCond = { id: status }
	if (search && search != '' && search != null) {
		whereCond[Op.or] = [
			{
				name: {
					[Op.like]: `%${search}%`,
				},
			},
			{
				slug: {
					[Op.like]: `%${search}%`,
				},
			},
		]
	}
	const data = await courseModel.findAll({
		where: whereCond,
		include: [
			{
				model: statusModel,
				as: 'status',
				// require: true,
				// where: statusCond,
			},
		],
		attributes: ['id', 'name', 'slug', 'created_at', 'price'],
		limit: 10,
	})
	return data
}

module.exports.searchNoticeCategoryList = async (search) => {
	const whereCond = {}
	if (search && search != '' && search != null) {
		whereCond[Op.or] = [
			{
				name: {
					[Op.like]: `%${search}%`,
				},
			},
			{
				slug: {
					[Op.like]: `%${search}%`,
				},
			},
		]
	}

	const data = await noticeCategoryModel.findAll({
		where: whereCond,

		attributes: ['id', 'name', 'slug', 'created_at'],
		limit: 10,
	})
	return data
}

module.exports.courseFullDetails = async (courseId) => {
	const data = await courseModel.findOne({
		where: {
			id: courseId,
		},
	})
	return data
}
module.exports.courseInitData = async (courseId, userId, language) => {
	const data = await courseModel.findOne({
		where: {
			id: courseId,
		},
		include: [
			{
				model: courseMultiLanguageModel,
				as: 'courseData',
				...(language && {
					where: { language_code: language },
				}),
			},
			{
				model: languageModel,
				as: 'language',
			},
			{
				model: courseForModel,
				as: 'courseFor',
			},
			{
				model: userModel,
				as: 'author',
				attributes: ['id', 'name', 'avatar'],
			},
			{
				model: courseCategoryModel,
				as: 'courseCategories',
				require: true,
				include: [
					{
						model: noticeCategoryModel,
						as: 'category',
						attributes: ['name', 'id', 'slug'],
					},
				],
			},
			{
				model: courseModuleModel,
				as: 'courseModules',
				attributes: [
					'id',
					'name',
					'duration',
					'module_index',
					'course_id',
				],
				include: [
					{
						model: courseModuleMultiLanguageModel,
						...(language && {
							where: {
								language_code: language,
							},
						}),
						as: 'moduleData',
					},
					{
						model: courseLecturesModel,
						as: 'courseLectures',
						attributes: [
							'id',
							'name',
							'duration',
							'lecture_index',
							'course_id',
							'module_id',
							'description',
							'live_stream_url',
							'sub_module_id',
							'video_thumbnail',
						],
						order: [],
						include: [
							{
								model: courseDocumentModel,
								as: 'documents',
							},
							{
								model: courseLectureMultiLanguageModel,
								...(language && {
									where: {
										language_code: language,
									},
								}),
								as: 'lectureData',
							},
							{
								model: courseSubModuleModel,
								as: 'sub_modules',
							},
						],
					},
					{
						model: courseExamModel,
						as: 'examData',

						attributes: [
							'name',
							'instruction',
							'duration',
							'reward',
							'id',
							'is_disabled',
						],
						include: [
							{
								model: courseExamMultiLanguageModel,
								as: 'examData',
								...(language && {
									where: {
										language_code: language,
									},
								}),
							},
						],
					},
				],
			},
		],
		attributes: [
			'id',
			'name',
			'sub_title',
			'features_list',
			'learning_points',
			'slug',
			'description',
			'url_image',
			'url_image_mobile',
			'url_image_thumbnail',
			'signed_url_image',
			'signed_url_image_mobile',
			'signed_url_image_thumbnail',
			'is_partial_payment_available',
			'duration',
			'price',
			'is_nft_free',
			'is_sold_out',
			'custom_field_1',
			'custom_field_2',
			'custom_field_3',
			'custom_field_4',
			'custom_field_5',
			'custom_field_6',
			'custom_field_7',
			'custom_field_8',
			'custom_field_9',
			'custom_field_10',
			'online_text',
			'total_modules',
			'training_type',
			'access_type',
			'launguage',
			'ratings',
			'telegram_link',
			'whatsapp_link',
			'telegram_users_google_link',
		],
		order: [
			[
				{ model: courseModuleModel, as: 'courseModules' },
				'module_index',
				'ASC',
			],
			[
				{ model: courseModuleModel, as: 'courseModules' },
				{ model: courseLecturesModel, as: 'courseLectures' },
				'lecture_index',
				'ASC',
			],
		],
		logging: console.log,
	})
	if (language && data?.courseData) {
		data.name = data.courseData?.name
		data.sub_title = data.courseData.sub_title
		data.features_list = data.courseData.sub_title
		data.learning_points = data.courseData.learning_points
		data.slug = data.courseData?.slug
		data.description = data.courseData?.description
		data.url_image = data.courseData?.url_image
		data.url_image_mobile = data.courseData?.url_image_mobile
		data.url_image_thumbnail = data.courseData?.url_image_thumbnail
		data.signed_url_image = data.courseData?.signed_url_image
		data.signed_url_image_mobile = data.courseData?.signed_url_image_mobile
		data.signed_url_image_thumbnail =
			data.courseData?.signed_url_image_thumbnail
		data.courseModules.forEach((eachModle) => {
			eachModle.courseLectures.forEach((eachLecture) => {
				eachLecture.name = eachLecture.lectureData?.name
				eachLecture.description = eachLecture.lectureData?.description
				eachLecture = eachLecture
			})
			eachModle.name = eachModle.moduleData?.name
			eachModle.description = eachModle.moduleData?.description
			eachModle = eachModle
			if (eachModle.examData) {
				eachModle.examData.name = eachModle.examData.examData?.name
				eachModle.examData.instruction =
					eachModle.examData.examData?.instruction
			}
		})
	}
	return data
}

module.exports.courseDetails = async (value, field) => {
	const data = await courseModel.findOne({
		where: {
			[`${field}`]: value,
		},
		attributes: [
			'id',
			'name',
			'slug',
			'price',
			'mct_amount',
			'stripe_price_id',
			'active_campagine_tag',
			'duration',
			'description',
			'split_payment_amounts',
			'sub_title',
			'is_partial_payment_available',
			'partialpay_stripe_price_obj',
			'nft_purchase_price',
			'nft_stripe_id',
			'is_public',
			'split_payment_amounts_obj',
		],
	})
	return data
}

module.exports.moduleDetails = async (value, field) => {
	const data = await courseModuleModel.findOne({
		where: {
			[`${field}`]: value,
		},
		attributes: ['id', 'name', 'duration', 'module_index'],
		order: [['module_index', 'DESC']],
	})
	return data
}

module.exports.lectureDetails = async (value, field) => {
	const data = await courseLecturesModel.findOne({
		where: {
			[`${field}`]: value,
		},
		attributes: [
			'course_id',
			'module_id',
			'name',
			'duration',
			'lecture_index',
			'description',
			'live_stream_url',
			'video_thumbnail',
		],
		order: [['lecture_index', 'DESC']],
	})
	return data
}

module.exports.lectureDetailsMultiLang = async (value, field) => {
	const data = await courseLectureMultiLanguageModel.findOne({
		where: {
			[`${field}`]: value,
		},
		attributes: [
			`lecture_id`,
			`name`,
			`description`,
			`duration`,
			`video_thumbnail`,
			`video_url`,
			`live_stream_url`,
		],
	})
	return data
}
module.exports.addCourse = async (couresData) => {
	const data = await courseModel.create(couresData)
	return data
}

module.exports.addMonduleToCourse = async (moduleData) => {
	const data = await courseModuleModel.create(moduleData)
	return data
}

module.exports.addSubModuleToCourse = async (moduleData) => {
	const data = await courseSubModuleModel.create(moduleData)
	return data
}

module.exports.addLectureToModule = async (lectureData) => {
	const data = await courseLecturesModel.create(lectureData)
	return data
}

module.exports.addMultipuleLectureToModule = async (lectureData) => {
	const data = await courseLecturesModel.bulkCreate(lectureData)
	return data
}

module.exports.addLectureDocument = async (documentData) => {
	const data = await courseDocumentModel.create(documentData)
	return data
}

module.exports.updateModule = async (module_id, moduleData) => {
	const data = await courseModuleModel.update(moduleData, {
		where: {
			id: module_id,
		},
	})
	return await courseModuleModel.findOne({
		where: {
			id: module_id,
		},
	})
}

module.exports.updateLectureMultiLang = async (lecture_id, lectureData) => {
	console.log('lecture_id', lecture_id, lectureData)
	const data = await courseLectureMultiLanguageModel.update(lectureData, {
		where: {
			lecture_id,
		},
	})
	return await courseLectureMultiLanguageModel.findOne({
		where: {
			lecture_id,
		},
		attributes: [
			`lecture_id`,
			`name`,
			`description`,
			`duration`,
			`video_thumbnail`,
			`video_url`,
			`live_stream_url`,
		],
	})
}

module.exports.updateLecture = async (lecture_id, lectureData) => {
	console.log('lecture_id', lecture_id, lectureData)
	const data = await courseLecturesModel.update(lectureData, {
		where: {
			id: lecture_id,
		},
	})
	return await courseLecturesModel.findOne({
		where: {
			id: lecture_id,
		},
		attributes: [
			`id`,
			`course_id`,
			`module_id`,
			`name`,
			`description`,
			`duration`,
			`video_thumbnail`,
			`video_url`,
			`lecture_index`,
			`live_stream_url`,
			`created_at`,
			`updated_at`,
			`sub_module_id`,
		],
	})
}

module.exports.updateCourse = async (course_id, courseData) => {
	const data = await courseModel.update(courseData, {
		where: {
			id: course_id,
		},
	})
	return data
}

module.exports.userCourseData = async (course_id, user_id) => {
	const data = await userHistoryCoursedModel.findOne({
		where: {
			user_id,
			course_id,
		},
	})
	return data
}

module.exports.currentLecture = async (
	course_id,
	module_id,
	current_lec_id,
	language
) => {
	const data = await courseLecturesModel.findOne({
		where: {
			course_id,
			module_id,
			id: current_lec_id,
		},
		attributes: [
			'video_url',
			'lecture_index',
			'id',
			'module_id',
			'name',
			'live_stream_url',
			'video_thumbnail',
			[
				sequelize.literal(
					'(SELECT module_index FROM course_modules WHERE `course_modules`.`id` = ' +
						module_id +
						')'
				),
				'module_index',
			],
		],
		include: [
			{
				model: courseLectureMultiLanguageModel,
				...(language && {
					where: {
						language_code: language,
					},
				}),
				as: 'lectureData',
			},
		],
	})
	if (language) {
		data.name = data.lectureData?.name
		data.video_url = data.lectureData?.video_url
		data.live_stream_url = data.lectureData?.live_stream_url
	}
	return data
}

module.exports.addCourseToUserData = async (courseToUser) => {
	console.log('courseToUser', courseToUser)
	courseToUser.created_at = moment().utc().toDate()
	courseToUser.started_at = null
	const data = await userHistoryCoursedModel.create(courseToUser)
	return data
}

module.exports.addCourseToUserTransaction = async (transactionData) => {
	console.log('transactionData', transactionData)
	transactionData.created_at = moment().utc().toDate()
	const data = await courseUserModel.create(transactionData)
	return data
}

module.exports.userCoursesDetails = async (courseId, userId) => {
	const data = await courseUserModel.findOne({
		where: {
			course_id: courseId,
			user_id: userId,
			status: 1,
		},
		attributes: [
			'id',
			'course_id',
			'package_id',
			'discount_id',
			'user_id',
			'coinbase_id',
			'paypal_id',
			'stripe_id',
			'transaction_id',
			'status',
			'address_id',
			'referal_user_id',
			'is_discount_used',
			'used_discount_id',
			'is_partial_payment',
			'payment_devied_in',
			'remian_payments',
			'next_payment_date',
			'each_payment_amount',
			'next_payment_stripe_id',
			'purchase_amount_usd',
			'payment_details',
			'sales_agent',
			'telegram_username_submitted',
		],
	})
	return data
}

module.exports.addCourserCategoryToDb = async (
	courseId,
	categoryId,
	languageId
) => {
	const data = await courseCategoryModel.create({
		course_id: courseId,
		category_id: categoryId,
		language_id: languageId,
	})
	return data
}

module.exports.moduleExamData = async (courseId, moduleId) => {
	const data = await courseExamModel.findOne({
		where: {
			course_id: courseId,
			module_id: moduleId,
		},
	})
	return data
}

module.exports.getAllSubModules = async (module_id) => {
	const data = await courseSubModuleModel.findAll({
		where: {
			module_id,
		},
	})
	return data
}
module.exports.moduleListWithExam = async (courseId) => {
	const data = await courseModuleModel.findAll({
		where: {
			course_id: courseId,
		},
		order: [
			['module_index', 'ASC'],
			['created_at', 'ASC'],
		],
		attributes: ['id'],
		include: [
			{
				model: courseExamModel,
				as: 'examData',
				attributes: ['id'],
			},
		],
	})
	return data
}

module.exports.addExamToDb = async (examData) => {
	const data = await courseExamModel.create(examData)
	return data
}
module.exports.addQuestionToExam = async (questionData) => {
	const data = await questionExamModel.create(questionData)
	return data
}

module.exports.listUserCourses = async (userId, language) => {
	const data = await userHistoryCoursedModel.findAll({
		where: {
			user_id: userId,
		},
		include: [
			{
				model: courseModel,
				as: 'courseData',
				require: true,
				attributes: [
					'id',
					'name',
					'slug',
					'description',
					'url_image',
					'url_image_mobile',
					'url_image_thumbnail',
					'signed_url_image',
					'signed_url_image_mobile',
					'signed_url_image_thumbnail',
					'duration',
					'price',
					[
						sequelize.literal(
							'(SELECT COUNT("id") FROM testimonials WHERE `testimonials`.`id` = `courseData`.`id`)'
						),
						'total_reviews',
					],
					[
						sequelize.literal(
							'IFNULL((SELECT AVG("star") FROM testimonials WHERE `testimonials`.`id` = `courseData`.`id`), 0)'
						),
						'star_avg',
					],
					'is_public',
					'is_nft_free',
					'nft_purchase_price',
					'nft_stripe_id',
					'brochure_url',
					'created_at',
					'Is_NFT_Available',
					'is_sold_out',
				],
				include: [
					{
						model: courseCategoryModel,
						as: 'courseCategories',
						include: [
							{
								model: noticeCategoryModel,
								as: 'category',
								attributes: ['name', 'id', 'slug'],
							},
						],
						require: true,
					},
					{
						model: courseMultiLanguageModel,
						...(language && {
							where: { language_code: language },
						}),
						attributes: [
							'name',
							'slug',
							'description',
							'url_image',
							'url_image_mobile',
							'url_image_thumbnail',
							'signed_url_image',
							'signed_url_image_mobile',
							'signed_url_image_thumbnail',
						],
						as: 'courseData',
					},
				],
			},
		],
		attributes: [
			'id',
			'course_id',
			'user_id',
			'completed_md_ids',
			'completed_lec_ids',
			'current_md_id',
			'current_lec_id',
			'progress',
			'completed_exam_ids',
			'course_status',
			'started_at',
			'completed_at',
			'last_watch_module',
			'last_watch_lecture',
			'last_watch_duration',
			'total_reward_earned',
			'is_nft_minted',
			'nft_data',
		],
	})
	let finalData = []
	data.map((eachList) => {
		if (
			language &&
			eachList.dataValues.courseData?.dataValues?.courseData
		) {
			eachList.dataValues.courseData.name =
				eachList.dataValues.courseData.dataValues.courseData?.name
			eachList.dataValues.courseData.slug =
				eachList.dataValues.courseData.dataValues.courseData?.slug
			eachList.dataValues.courseData.description =
				eachList.dataValues.courseData.dataValues.courseData?.description
			eachList.dataValues.courseData.url_image =
				eachList.dataValues.courseData.dataValues.courseData?.url_image
			eachList.dataValues.courseData.url_image_mobile =
				eachList.dataValues.courseData.dataValues.courseData?.url_image_mobile
			eachList.dataValues.courseData.url_image_thumbnail =
				eachList.dataValues.courseData.dataValues.courseData?.url_image_thumbnail
			eachList.dataValues.courseData.signed_url_image =
				eachList.dataValues.courseData.dataValues.courseData?.signed_url_image
			eachList.dataValues.courseData.signed_url_image_mobile =
				eachList.dataValues.courseData.dataValues.courseData?.signed_url_image_mobile
			eachList.dataValues.courseData.signed_url_image_thumbnail =
				eachList.dataValues.courseData.dataValues.courseData?.signed_url_image_thumbnail
			finalData.push(eachList)
		} else {
			if (!language) {
				finalData.push(eachList)
			}
		}
	})
	return finalData
}

module.exports.userCourseLecturesList = async (courseId) => {
	const data = await courseModel.findOne({
		where: {
			id: courseId,
		},
		include: [
			{
				model: courseModuleModel,
				as: 'courseModules',
				attributes: [
					'id',
					'name',
					'duration',
					'module_index',
					'course_id',
				],
				include: [
					{
						model: courseLecturesModel,
						as: 'courseLectures',
						attributes: [
							'id',
							'name',
							'duration',
							'lecture_index',
							'course_id',
							'module_id',
							'description',
							'live_stream_url',
							'video_thumbnail',
						],
						order: [['lecture_index', 'ASC']],
					},
					{
						model: courseExamModel,
						as: 'examData',
						attributes: [
							'name',
							'instruction',
							'duration',
							'reward',
							'id',
						],
					},
				],
				order: [['module_index', 'ASC']],
			},
		],
		attributes: ['id', 'name'],
	})
	return data
}

module.exports.lastLectureOfModule = async (courseId, moduleId) => {
	const data = await courseLecturesModel.findOne({
		where: {
			module_id: moduleId,
		},
		attributes: ['id', 'module_id', 'lecture_index'],
		order: [['lecture_index', 'DESC']],
	})
	return data
}

module.exports.updateUserCourseData = async (userCourserId, userUpdateData) => {
	const data = await userHistoryCoursedModel.update(userUpdateData, {
		where: {
			id: userCourserId,
		},
	})
	return data
}

module.exports.examList = async (courseId) => {
	const data = await courseExamModel.findAll({
		where: {
			course_id: courseId,
			is_disabled: 0,
		},
		attributes: ['id', 'name', 'course_id', 'reward', 'created_at'],
	})
	return data
}

module.exports.nextLectureAndModuleId = async (courseId) => {
	// const data = await
}

module.exports.addCourseForData = async (courseForData) => {
	const data = await courseForModel.create(courseForData)
	return data
}

module.exports.moduleList = async (courseId) => {
	const data = await courseModuleModel.findAll({
		where: {
			course_id: courseId,
		},
		attributes: ['id', 'name', 'duration', 'module_index', 'created_at'],
	})
	return data
}

module.exports.userCourseUpdate = async (courseUserId, updateData) => {
	const data = await courseUserModel.update(updateData, {
		where: {
			id: courseUserId,
		},
	})
	return data
}

module.exports.getCourseListPayedByPaypal = async (whereCond = {}) => {
	const data = await courseUserModel.findAll({
		where: whereCond,
		attributes: [
			'id',
			'user_id',
			'course_id',
			'coinbase_id',
			'paypal_id',
			'status',
			'stripe_id',
			'package_id',
			'discount_id',
			'used_discount_id',
			'mc_amount',
			'payment_details',
			'purchase_amount_usd',
			'sales_agent',
		],
	})
	console.log('data with cart', data)
	return data
}

module.exports.getCourseListCoinbaseCommerce = async (paymentId) => {
	const data = await courseUserModel.findAll({
		where: {
			coinbase_id: paymentId,
		},
		attributes: [
			'id',
			'user_id',
			'course_id',
			'coinbase_id',
			'paypal_id',
			'status',
			'stripe_id',
			'package_id',
			'discount_id',
			'used_discount_id',
			'mc_amount',
			'payment_details',
			'sales_agent',
			'purchase_amount_usd',
		],
	})
	return data
}
module.exports.addUserTransaction = async (userTransactionData) => {
	userTransactionData.created_at = moment().utc().toDate()
	return await userTransactionModel.create(userTransactionData)
}

module.exports.findCurrentAndNextLecture = async (
	{
		completed_lec_ids,
		completed_md_ids,
		last_watch_lecture,
		last_watch_module,
	},
	{ courseModules }
) => {
	const completedLectures = completed_lec_ids
		? completed_lec_ids.split(',')
		: []
	const completedModules = completed_md_ids ? completed_md_ids.split(',') : []
	const courseModuleArray = []
	const courseLectureArray = []
	courseModules.forEach((eachModule) => {
		courseModuleArray.push(eachModule.id)
		eachModule.courseLectures.forEach((eachLecture) => {
			courseLectureArray.push(eachLecture.id)
		})
	})
	const remainLecturesArr = courseLectureArray.filter(
		(n) => !completedLectures.includes(String(n))
	)
	const remainModulesArr = courseModuleArray.filter(
		(n) => !completedModules.includes(String(n))
	)
	const [nextLecture] = remainLecturesArr
	const [nextModule] = remainModulesArr
	return { nextLecture, nextModule }
}

module.exports.isTransactionExist = async (transactionId) => {
	return await userTransactionModel.findOne({
		where: { transaction_id: transactionId },
		attributes: ['id'],
	})
}

module.exports.categoryList = async () => {
	return await noticeCategoryModel.findAll({
		attributes: [
			'id',
			'name',
			'slug',
			'created_at',
			'updated_at',
			'language_id',
		],
	})
}

module.exports.categoryListByLang = async (language) => {
	return await noticeCategoryLangModel.findAll({
		where: {
			language_code: language,
		},
		attributes: [['category_id', 'id'], 'name', 'slug'],
	})
}

module.exports.addCoursePackage = async (packageData) => {
	return await packageCourses.create(packageData)
}

module.exports.Packages = async () => {
	return await packageCourses.findAll({
		where: {
			is_active: 1,
		},
		order: [['created_at', 'DESC']],
	})
}

module.exports.packageDetails = async (packageId, isActive = null) => {
	return await packageCourses.findOne({
		where: {
			id: packageId,
			is_active: isActive == null ? 1 : isActive,
		},
	})
}
module.exports.packageCourses = async (courseArr) => {
	return await courseModel.findAll({
		where: {
			id: {
				[Op.in]: courseArr,
			},
		},
		include: [
			{
				model: languageModel,
				as: 'language',
			},
			{
				model: courseForModel,
				as: 'courseFor',
			},
			{
				model: userModel,
				as: 'author',
				attributes: ['id', 'name', 'avatar'],
			},
			{
				model: courseModuleModel,
				as: 'courseModules',
				attributes: ['id', 'module_index', 'name', 'description'],
				order: [['module_index', 'ASC']],
				include: [
					{
						model: courseLecturesModel,
						as: 'courseLectures',
						attributes: [
							'id',
							'name',
							'duration',
							'lecture_index',
							'course_id',
							'module_id',
							'description',
							'live_stream_url',
							'video_thumbnail',
						],
						order: [['lecture_index', 'ASC']],
					},
				],
			},
			{
				model: courseCategoryModel,
				as: 'courseCategories',
				require: true,
				include: [
					{
						model: noticeCategoryModel,
						as: 'category',
						attributes: ['name', 'id', 'slug'],
					},
				],
			},
		],
		attributes: [
			'id',
			'name',
			'sub_title',
			'features_list',
			'learning_points',
			'slug',
			'description',
			'url_image',
			'url_image_mobile',
			'url_image_thumbnail',
			'signed_url_image',
			'signed_url_image_mobile',
			'signed_url_image_thumbnail',
			'duration',
			'price',
		],
	})
}

module.exports.isUserPurchasedPack = async (userId, packageId) => {
	return await courseUserModel.findOne({
		where: {
			user_id: userId,
			package_id: packageId,
			status: 1,
		},
		attributes: ['id'],
	})
}

module.exports.discountDetails = async (value, field = 'id') => {
	return await discountModels.findOne({
		where: {
			[`${field}`]: value,
		},
		attributes: [
			'id',
			'name',
			'discount_amount',
			'stripe_coupon_id',
			'stripe_product_id',
			'stripe_price_id',
			'is_active',
			'for_all_package',
			'for_all_courses',
			'package_list',
			'course_list',
			'created_at',
		],
	})
}

module.exports.isCouponPurchased = async (userId, couponId) => {
	return await courseUserModel.findOne({
		where: {
			discount_id: couponId,
			user_id: userId,
			status: 1,
		},
		attributes: [
			'id',
			'course_id',
			'package_id',
			'discount_id',
			'user_id',
			'coinbase_id',
			'paypal_id',
			'stripe_id',
			'transaction_id',
			'status',
			'address_id',
			'referal_user_id',
			'is_partial_payment',
			'payment_devied_in',
			'remian_payments',
			'next_payment_date',
			'each_payment_amount',
		],
	})
}

module.exports.updateDiscountIdMarktAsUsed = async (discountId, userId) => {
	return await courseUserModel.update(
		{ is_discount_used: 1 },
		{
			where: {
				user_id: userId,
				discount_id: discountId,
				status: 1,
			},
			logging: console.log,
		}
	)
}

module.exports.markAsFailed = async (coinbaseId) => {
	return await courseUserModel.update(
		{
			status: 2,
		},
		{
			where: {
				coinbase_id: coinbaseId,
			},
		}
	)
}

module.exports.checkIsCoursePartiallyPurchased = async (courseId, userId) => {
	return await courseUserModel.findOne({
		where: {
			user_id: userId,
			course_id: courseId,
			is_partial_payment: 1,
			status: 1,
			remian_payments: {
				[Op.gt]: 0,
			},
		},
		attributes: ['id'],
	})
}

module.exports.publicCourseCheck = async (courseId) => {
	return await courseModel.findOne({
		where: {
			id: courseId,
			is_public: 1,
		},
		attributes: [
			'id',
			'active_campagine_list',
			'is_course_restricted_to_users',
		],
	})
}

module.exports.getLectureDocuments = async (lectureId) => {
	return await courseDocumentModel.findAll({
		where: {
			lecture_id: lectureId,
		},
	})
}

module.exports.getMctPriceInDoller = async (idList) => {
	console.log(idList)
	const ids = idList.split('\n')
	for (let i = 0; i < ids.length; i++) {
		ids[i] = ids[i].trim()
		const courseUserData = await courseUserModel.findOne({
			where: {
				transaction_id: ids[i],
			},
			attributes: ['course_id', 'user_id', 'package_id', 'discount_id'],
		})

		console.log(courseUserData)
		const transactionData = await userHistoryCoursedModel.findOne({
			row: true,
			where: {
				user_id: courseUserData.user_id,
				course_id: courseUserData.course_id,
			},
			attributes: ['mct_price_at_purchase'],
		})
		console.log(transactionData)
		console.log(ids[i], transactionData.mct_price_at_purchase)
	}
}

module.exports.userExamHistoryDetails = async (examId, userId) => {
	return await userHistoryExamModel.findOne({
		where: {
			exam_id: examId,
			user_id: userId,
		},
		attributes: [
			'id',
			'user_id',
			'exam_id',
			'is_passed',
			'is_point_collected',
			'reward_with',
			'is_point_collected',
			'reword_points',
		],
	})
}

module.exports.adminCourseList = async (language) => {
	const data = await courseModel.findAll({
		include: [
			{
				required: false,
				model: courseMultiLanguageModel,
				as: 'courseData',
				...(language && {
					where: { language_code: language },
				}),
			},
			{
				model: languageModel,
				as: 'language',
			},
		],
		attributes: {
			include: [
				[
					sequelize.literal(
						'(SELECT COUNT("id") FROM history_user_courses WHERE `history_user_courses`.`course_id` = `courses`.`id`)'
					),
					'total_user_purchased_count',
				],
			],
		},
		order: [['created_at', 'DESC']],
	})

	data.map((eachList) => {
		if (language && eachList.courseData) {
			eachList.name = eachList.courseData.name
			eachList.slug = eachList.courseData.slug
			eachList.description = eachList.courseData.description
			eachList.url_image = eachList.courseData.url_image
			eachList.url_image_mobile = eachList.courseData.url_image_mobile
			eachList.url_image_thumbnail =
				eachList.courseData.url_image_thumbnail
			eachList.signed_url_image = eachList.courseData.signed_url_image
			eachList.signed_url_image_mobile =
				eachList.courseData.signed_url_image_mobile
			eachList.signed_url_image_thumbnail =
				eachList.courseData.signed_url_image_thumbnail
		}
	})
	return data
}

module.exports.removeDocFromAws = async (documentId) => {
	return await courseDocumentModel.destroy({
		where: {
			id: documentId,
		},
	})
}

module.exports.deleteLecture = async (lecture_id) => {
	return await courseLecturesModel.destroy({
		where: {
			id: lecture_id,
		},
	})
}

module.exports.deleteModule = async (module_id) => {
	return await courseModuleModel.destroy({
		where: {
			id: module_id,
		},
	})
}

module.exports.getUserCourseRemainders = async (courseId, userId) => {
	const data = await courseUserModel.findAll({
		where: {
			is_remainder_notifications_enabled: 1,
			status: 1,
		},
		attributes: [
			'id',
			'is_first_remainder_sent',
			'is_second_remainder_sent',
			'is_third_remainder_sent',
			'is_fourth_remainder_sent',
			[
				sequelize.literal(
					'(SELECT name FROM courses WHERE `courses`.`id` = `courses_users`.`course_id`)'
				),
				'courseName',
			],
			[
				sequelize.literal(
					'(SELECT progress FROM history_user_courses WHERE `history_user_courses`.`course_id` = `courses_users`.`course_id` and `history_user_courses`.`user_id` = `courses_users`.`user_id` )'
				),
				'progress',
			],
			[
				sequelize.literal(
					'(SELECT name FROM users WHERE `users`.`id` = `courses_users`.`user_id` )'
				),
				'userName',
			],
			[
				sequelize.literal(
					'(SELECT email FROM users WHERE `users`.`id` = `courses_users`.`user_id` )'
				),
				'email',
			],
		],
	})
	return data
}

exports.enableRemainderNotifications = async (
	course_id,
	is_remainder_notifications_enabled,
	user_id
) => {
	try {
		const data = await courseUserModel.update(
			{
				is_remainder_notifications_enabled,
			},
			{
				where: {
					course_id,
					user_id,
					status: 1,
				},
			}
		)
		return data
	} catch (err) {
		return false
	}
}

exports.first_remainder_sent = async (id) => {
	try {
		const data = await courseUserModel.update(
			{
				is_first_remainder_sent: 1,
			},
			{
				where: {
					id,
				},
			}
		)
		return data
	} catch (err) {
		return false
	}
}
exports.second_remainder_sent = async (id) => {
	try {
		const data = await courseUserModel.update(
			{
				is_second_remainder_sent: 1,
			},
			{
				where: {
					id,
				},
			}
		)
		return data
	} catch (err) {
		return false
	}
}
exports.third_remainder_sent = async (id) => {
	try {
		const data = await courseUserModel.update(
			{
				is_third_remainder_sent: 1,
			},
			{
				where: {
					id,
				},
			}
		)
		return data
	} catch (err) {
		return false
	}
}
exports.fourth_remainder_sent = async (id) => {
	try {
		const data = await courseUserModel.update(
			{
				is_fourth_remainder_sent: 1,
			},
			{
				where: {
					id,
				},
			}
		)
		return data
	} catch (err) {
		return false
	}
}

module.exports.addCourseInvoice = async (data) => {
	return await courseInvoiceeModel.create(data)
}

module.exports.updateUserTelegramSubmission = async (user_id, course_id) => {
	return await courseUserModel.update(
		{ telegram_username_submitted: 1 },
		{
			where: {
				user_id,
				course_id,
				status: 1,
			},
			logging: console.log,
		}
	)
}
