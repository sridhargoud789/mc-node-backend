const { Op } = require('sequelize')
const sequelize = require('sequelize')

const dbObj = require('../../models/index')
const moment = require('moment')
const userModel = dbObj.users
const userRoleModel = dbObj.roles
const userLevelModel = dbObj.levels
const newsLetterModel = dbObj.newsletters
const levelsModel = dbObj.levels
const userCryptoModel = dbObj.user_cryptos
const apiCryptoModel = dbObj.api_cryptos
const testimonialModel = dbObj.testimonials
const userCourseModel = dbObj.courses_users
const passwordResetModel = dbObj.password_resets
const historyUserCourses = dbObj.history_user_courses
const userCartModel = dbObj.user_cart
const examModel = dbObj.course_exams
const examQuestionModel = dbObj.exam_questions
const userHistoryExamsModel = dbObj.history_user_exams
const addressUserModel = dbObj.users_addresses
const userWalletModel = dbObj.users_wallets
const userNotificationModel = dbObj.users_notifications
const userInvoiceModel = dbObj.user_transactions
const userPrivacyPolicyModel = dbObj.user_privacy_policies
const courseUserModel = dbObj.courses_users
const coursePackagesModel = dbObj.course_packages
const examQuestionMappingModel = dbObj.exam_questions_mappings
const referralCodeModel = dbObj.referral_codes
const tokenHolderModle = dbObj.token_holders
const mcWalletModel = dbObj.mc_wallets
const historyMcWalletsModel = dbObj.history_mc_wallets
const referralCodesMcWalletModel = dbObj.referral_codes_mc_wallets
const userInquiries = dbObj.user_inquiries
const userPhoneNumberModel = dbObj.user_phone_numbers
const freeCourseWhitelistUsersModel = dbObj.free_course_white_list_users
const courseQuestionAnswers = dbObj.course_questions_answers
const courseQuestionComments = dbObj.course_questions_comments
const courseQuestionLike = dbObj.course_questions_likes
const lectureLikeDislikes = dbObj.lectures_likes

const courseAnnouncements = dbObj.course_announcements
const courseAnnouncementComments = dbObj.course_announcements_comments

const courseNotes = dbObj.course_notes

module.exports.userCounts = async () => {
	const counts = await userModel.findAll({
		where: {},
		attributes: { exclude: ['createdAt', 'updatedAt'] },
	})
	return counts
}

module.exports.userDetails = async (userId) => {
	return await userModel.findOne({
		where: {
			id: userId,
		},
		attributes: [
			'id',
			'email',
			'active_campagin_id',
			'name',
			'phone_number',
			'address_line1',
			'address_line2',
			'state',
			'country',
		],
	})
}
module.exports.isEmailExist = async (email) => {
	const user = await userModel.findOne({
		where: { email },
	})
	return user
}
module.exports.saveUser = async (userData) => {
	const newUser = await userModel.create(userData)
	return newUser
}
module.exports.userRoleData = async (code) => {
	return await userRoleModel.findOne({
		where: {
			code: code,
		},
		attributes: ['id', 'name', 'code'],
	})
}
module.exports.updateUser = async (userId, userUpdateData) => {
	return await userModel.update(userUpdateData, { where: { id: userId } })
}

module.exports.uploadProfilePic = async (userId, profilePic) => {
	return await userModel.update(
		{ avatar: profilePic },
		{
			where: {
				id: userId,
			},
		}
	)
}

module.exports.userLoginData = async (userId) => {
	const data = await userModel.findOne({
		where: {
			id: userId,
		},
		include: [
			{
				model: userRoleModel,
				as: 'roles',
				attributes: ['id', 'code', 'name'],
			},
			{
				model: levelsModel,
				as: 'levels',
				attributes: ['id', 'code', 'name'],
			},
			{
				model: userNotificationModel,
				as: 'notificationSettings',
				attributes: [
					'unusul_activity',
					'new_signin',
					'sales_news',
					'features_updates',
					'account_tips',
					'course_update',
					'course_teacher_discussion',
					'course_personalized_rec',
					'course_featured_content',
					'course_product_update',
					'course_event_offer_update',
				],
			},
		],
	})
	return data
}

module.exports.levelDetailsByCode = async (code) => {
	const data = await userLevelModel.findOne({
		where: {
			code,
		},
		attributes: ['id', 'code', 'name'],
	})
	return data
}

module.exports.userFavouriteCryptoList = async (userId) => {
	const data = await userCryptoModel.findAll({
		where: {
			user_id: userId,
		},
		include: [
			{
				model: apiCryptoModel,
				attributes: ['id', 'cg_id', 'cg_symbol', 'cg_name'],
			},
		],
	})
	return data
}

module.exports.publicTestimonials = async () => {
	const data = await testimonialModel.findAll({
		where: {
			is_public_visible: 1,
		},
		include: [
			{ model: userModel, as: 'user', attributes: ['name', 'avatar'] },
		],
		attributes: ['id', 'description', 'star', 'created_at'],
		order: [['id', 'DESC']],
	})
	return data
}

module.exports.userCourse = async (courseId, userId) => {
	const data = await userCourseModel.findOne({
		where: {
			course_id: courseId,
			user_id: userId,
			status: 1,
		},
		attributes: ['id'],
	})
	return data
}

module.exports.addToPasswordReset = async (passwordResetData) => {
	if (
		await passwordResetModel.findOne({
			where: {
				email: passwordResetData.email,
			},
			attributes: ['email'],
		})
	) {
		passwordResetData.create
		const data = await passwordResetModel.update(passwordResetData, {
			where: { email: passwordResetData.email },
		})
		return data
	} else {
		const data = await passwordResetModel.create(passwordResetData)
		return data
	}
}

module.exports.matchOtp = async (email, otp) => {
	const data = await passwordResetModel.findOne({
		where: {
			email,
			token: otp,
			expired_at: {
				[Op.gt]: moment().toDate(),
			},
		},
	})
	return data
}

module.exports.deleteUserOtp = async (email, otp) => {
	const data = await passwordResetModel.destroy({
		where: {
			email,
			token: otp,
		},
	})
}

module.exports.updateUserLastWatch = async (
	userCourseHistoryId,
	moduleId,
	lectureId,
	videoDuration
) => {
	const data = await historyUserCourses.update(
		{
			id: userCourseHistoryId,
			last_watch_module: moduleId,
			last_watch_lecture: lectureId,
			last_watch_duration: videoDuration,
		},
		{
			where: {
				id: userCourseHistoryId,
			},
		}
	)
	return data
}

module.exports.userCartCourses = async (userId) => {
	const data = await userCartModel.findAll({
		where: {
			user_id: userId,
		},
	})
	return data
}

module.exports.userCoursePurchased = async (userId, courseId) => {
	const data = await userCourseModel.findOne({
		where: {
			user_id: userId,
			course_id: courseId,
			status: 1,
		},
		attributes: ['id', 'course_id', 'user_id'],
	})
	return data
}

module.exports.userRequestExamByCourse = async (userId, courseId) => {
	const data = await historyUserCourses.findOne({
		where: {
			user_id: userId,
			course_id: courseId,
		},
		attributes: [
			'id',
			'course_id',
			'user_id',
			'completed_md_ids',
			'completed_lec_ids',
			'progress',
			'completed_exam_ids',
			'started_at',
			'completed_at',
			'exam_available_expiry_time',
		],
	})
	return data
}

module.exports.examData = async (examId) => {
	const data = await examModel.findOne({
		where: {
			id: examId,
		},
		attributes: [
			'id',
			'name',
			'instruction',
			'duration',
			'reward',
			'created_at',
			'updated_at',
		],
		include: [
			{
				model: examQuestionMappingModel,
				attributes: ['id', 'question_id', 'shuffle_index'],
				// include: [
				//   {
				//     model: examQuestionModel,
				//     attributes: ['id', 'question', 'answers', 'created_at', 'updated_at'],
				//     order: [
				//       [
				//         'created_at', 'ASC',
				//       ],
				//     ],
				//     as: 'questions',
				//   },

				// ],
				order: [['shuffle_index', 'ASC']],
				as: 'shuffleQuestions',
			},
		],
		group: ['shuffleQuestions.shuffle_index'],
		logging: console.log,
	})
	return data
}

module.exports.addressList = async (userId) => {
	const data = await addressUserModel.findAll({
		where: {
			user_id: userId,
		},
		order: [['created_at', 'ASC']],
		attributes: [
			'id',
			'first_name',
			'last_name',
			'phone_number',
			'address_line_1',
			'address_line_2',
			'state',
			'country',
			'zip_code',
			'is_default',
			'user_id',
			'created_at',
			'updated_at',
		],
	})
	return data
}

module.exports.removeAddress = async (addressId) => {
	const data = await addressUserModel.destroy({
		where: {
			id: addressId,
		},
	})
	return data
}

module.exports.saveAddress = async (addressData) => {
	const data = await addressUserModel.create(addressData)
	return data
}
module.exports.makeWalletDefault = async (userId, walletAddress) => {
	await userWalletModel.update(
		{
			is_default: 0,
		},
		{
			where: {
				user_id: userId,
				is_default: 1,
			},
		}
	)
	await userWalletModel.update(
		{
			is_default: 1,
		},
		{
			where: {
				user_id: userId,
				wallet_address: walletAddress,
			},
		}
	)
}

module.exports.userDetailsByWalletAddress = async (walletAddress) => {
	const data = await userModel.findOne({
		include: [
			{
				model: userWalletModel,
				where: {
					wallet_address: walletAddress,
				},
				require: true,
				attributes: ['user_id', 'wallet_address', 'id'],
				as: 'userWallets',
			},
		],
	})
	return data
}

module.exports.saveUserWalletAddress = async (
	userId,
	walletAddress,
	isDefault
) => {
	const data = await userWalletModel.create({
		user_id: userId,
		wallet_address: walletAddress,
		is_default: isDefault ? 0 : 1,
	})
	return data
}

module.exports.isUserHaveDefaultWallet = async (
	userId,
	walletAddress,
	isDefault
) => {
	const data = await userWalletModel.findOne({
		where: {
			user_id: userId,
			is_default: 1,
		},
	})
	return data
}

module.exports.walletList = async (userId) => {
	const data = await userWalletModel.findAll({
		where: {
			user_id: userId,
		},
	})
	return data
}

module.exports.removeWalletAddress = async (walletAddress) => {
	const data = await userWalletModel.destroy({
		where: {
			wallet_address: walletAddress,
		},
	})
	return data
}

module.exports.updateUserNotificationSetting = async (
	usreId,
	userUpdateData
) => {
	const data = await userNotificationModel.update(userUpdateData, {
		where: {
			user_id: userId,
		},
	})
	return data
}

module.exports.updateUserPrivacyPolicy = async (userId, userUpdateData) => {
	const data = await userPrivacyPolicyModel.update(userUpdateData, {
		where: {
			user_id: userId,
		},
	})
	return data
}
module.exports.calculateUserRewardPoints = async (userId) => {
	const data = await userHistoryExamsModel.findOne({
		where: {
			user_id: userId,
			reward_with: 'mct',
			reward_in: 'mct',
		},
		attributes: [
			[
				sequelize.literal(
					'IFNULL ( (SELECT SUM(`reword_points`)  FROM `history_user_exams` WHERE `history_user_exams`.`user_id` = ' +
						userId +
						' and `history_user_exams`.`is_point_collected` = 0 and  `history_user_exams`.`is_request_to_collect` = 0 and `history_user_exams`.`reward_with`="mct" and `history_user_exams`.`reward_in`="mct") , 0) '
				),
				'un_collected_points',
			],
			[
				sequelize.literal(
					'IFNULL ((SELECT SUM(`reword_points`)  FROM `history_user_exams`  WHERE `history_user_exams`.`user_id` = ' +
						userId +
						' and `history_user_exams`.`is_point_collected` = 0 and  `history_user_exams`.`is_request_to_collect` = 1 and `history_user_exams`.`reward_with`="mct" and `history_user_exams`.`reward_in`="mct") , 0 )'
				),
				'request_to_collect',
			],
		],
	})
	return data
}

module.exports.invcoices = async (userId) => {
	const data = await userInvoiceModel.findAll({
		where: {
			user_id: userId,
		},
		attributes: [
			'id',
			'amount',
			'transaction_id',
			'user_id',
			'payment_with',
			'created_at',
		],
		order: [['created_at', 'DESC']],
	})
	return data
}

module.exports.getAvailableCoupon = async (userId) => {
	const data = await courseUserModel.findAll({
		where: {
			user_id: userId,
			status: 1,
			is_discount_used: 0,
			discount_id: {
				[Op.ne]: null,
			},
		},
		attributes: ['id', 'discount_id', 'status'],
	})
	return data
}

module.exports.userPackages = async (userId) => {
	const data = await courseUserModel.findAll({
		where: {
			user_id: userId,
			status: 1,
			package_id: {
				[Op.ne]: null,
			},
		},
		attributes: ['id', 'package_id', 'user_id', 'status'],
	})
	return data
}

module.exports.updateCourseHistory = async (
	historyUserCourseId,
	updateData
) => {
	const data = await historyUserCourses.update(updateData, {
		where: {
			id: historyUserCourseId,
		},
	})
	return data
}

module.exports.referralCodeData = async (condition) => {
	return referralCodeModel.findOne({ where: { ...condition, is_active: 1 } })
}

module.exports.saveMCTHolderData = async (holdersData) => {
	return tokenHolderModle.bulkCreate(holdersData)
}

module.exports.checkHolder = async (user_id, walletList) => {
	return tokenHolderModle.findOne({
		where: {
			wallet: {
				[Op.in]: walletList,
			},
		},
	})
}
module.exports.summaryList = async () => {
	const data = await userCourseModel.findAll({
		where: {
			status: 1,
		},
		attributes: ['user_ip', 'stripe_id', 'coinbase_id', 'transaction_id'],
		// attributes: ['course_id', 'package_id', 'id', 'coinbase_id', 'stripe_id', 'transaction_id', 'user_ip' ],
		include: [
			{
				model: userModel,
				attributes: ['id', 'email', 'name', 'phone_number'],
				as: 'users',
			},
			{
				model: addressUserModel,
				attributes: [
					'id',
					'address_line_1',
					'address_line_2',
					'state',
					'country',
					'zip_code',
				],
				as: 'addressData',
			},
		],
		order: [['created_at', 'DESC']],
	})
	// console.log(data.length);
	for (let i = 0; i < data.length; i++) {
		const eachData = data[i]
		let method
		if (eachData.coinbase_id) {
			method = 'coinbase'
		} else if (eachData.stripe_id == 'Manual_Add_By_Admin') {
			method = 'none'
		} else if (eachData.transaction_id) {
			method = 'mct'
		} else if (eachData.stripe_id) {
			method = 'stripe'
		}
		eachData.dataValues['payment_method'] = method
		data[i] = eachData
		console.log(data[i])
	}
	return data
}

exports.walletData = async (userId) => {
	let data = await mcWalletModel.findOne({
		where: {
			user_id: userId,
		},
		attributes: ['id', 'user_id', 'token_balance', 'updated_at'],
	})
	if (!data) {
		await mcWalletModel.create({ user_id: userId, token_balance: 0 })
		data = await mcWalletModel.findOne({
			where: {
				user_id: userId,
			},
			attributes: ['id', 'user_id', 'token_balance', 'updated_at'],
		})
	}
	return data
}

exports.deductMctFromWallet = async (userId, updateData) => {
	console.log(userId, updateData)
	const data = await mcWalletModel.update(updateData, {
		where: { user_id: userId },
	})
	console.log('data', data)
	return data
}

exports.getMcReferralCodeData = async (referralCode) => {
	const data = await referralCodesMcWalletModel.findOne({
		where: {
			is_active: 1,
			code: referralCode,
			expired_at: {
				[Op.gt]: new Date(),
			},
		},
	})
	return data
}

exports.checkIsAlreadyRedeemed = async (referralCodeId, userId) => {
	const data = await historyMcWalletsModel.findOne({
		where: {
			user_id: userId,
			transaction_type: 'credit',
			referral_code: referralCodeId,
		},
	})
	return data
}

exports.addWalletHistory = async (walletHistory) => {
	console.log(walletHistory)
	const newHistory = await historyMcWalletsModel.create(walletHistory)
	return newHistory
}

exports.addToInquiries = async (userData) => {
	try {
		return await userInquiries.create(userData)
	} catch (err) {
		console.log(err)
		return false
	}
}

exports.saveOtp = async (otp, expiryTime, phone_number) => {
	try {
		const data = await userPhoneNumberModel.findOne({
			where: {
				phone_number,
			},
		})
		if (data) {
			console.log('data', data)
			await userPhoneNumberModel.update(
				{
					otp,
					expiry_time: expiryTime,
					phone_number,
				},
				{
					where: {
						phone_number,
					},
				}
			)
		} else {
			console.log('in else', data)
			await userPhoneNumberModel.create({
				otp,
				expiry_time: expiryTime,
				phone_number,
			})
		}
	} catch (err) {
		console.log(err)
		return false
	}
}

exports.verifyOtp = async (phone_number, otp) => {
	try {
		const data = await userPhoneNumberModel.findOne({
			where: {
				phone_number,
				otp,
			},
		})
		return data
	} catch (err) {
		console.log(err)
		return false
	}
}

exports.updateOtpVerified = async (phone_number) => {
	try {
		const data = await userPhoneNumberModel.update(
			{
				is_verified: 1,
			},
			{
				where: {
					phone_number,
				},
			}
		)
		return data
	} catch (err) {
		return false
	}
}

exports.isUserWhitelisted = async (email) => {
	try {
		return await freeCourseWhitelistUsersModel.findOne({
			where: {
				email,
			},
		})
	} catch (err) {
		return false
	}
}

exports.list = async (per_page, page = 1, search) => {
	try {
		let searchCond = {}
		if (search) {
			searchCond = {
				where: {
					[Op.or]: {
						name: {
							[Op.like]: search,
						},
						email: {
							[Op.like]: search,
						},
					},
				},
			}
		}
		console.log(searchCond)
		const data = await userModel.findAll({
			...searchCond,
			exclude: ['password', 'token'],
			attributes: ['id', 'email', 'name'],
			order: [['id', 'DESC']],
			// offset: (page - 1) * per_page,
			// limit: Number(per_page),
			include: [
				{
					model: mcWalletModel,
					as: 'mcWalletData',
					attributes: ['token_balance'],
				},
			],
		})
		return data
	} catch (err) {
		return []
	}
}

module.exports.getcourseQuestionAnswers = async (
	created_by,
	course_id,
	lecture_id
) => {
	try {
		return await courseQuestionAnswers.findAll({
			where: { course_id, lecture_id, is_deleted: 0 },
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT ifnull(name,email) as name FROM users WHERE `users`.`id` = `course_questions_answers`.`created_by`)'
						),
						'createdBy_username',
					],
					[
						sequelize.literal(
							'(SELECT ifnull(name,email) as name FROM users WHERE `users`.`id` = `course_questions_answers`.`answered_by`)'
						),
						'answeredBy_username',
					],
				],
			},
		})
	} catch (err) {
		console.log(err)
		return false
	}
}
exports.addUserCourseQuestion = async (data) => {
	console.log(data)
	const newData = await courseQuestionAnswers.create(data)
	return newData
}

exports.updateQuestionAnser = async (id, answer, answered_by) => {
	try {
		const data = await courseQuestionAnswers.update(
			{
				answer,
				answered_by,
				answered_at: new Date(),
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
exports.deleteCourseQuestion = async (id) => {
	try {
		const data = await courseQuestionAnswers.update(
			{
				is_deleted: 1,
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
exports.approveQuestionAnswer = async (id, is_approved, approved_by) => {
	try {
		const data = await courseQuestionAnswers.update(
			{
				is_approved,
				approved_by,
				approved_at: new Date(),
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

module.exports.getcourseQuestionComments = async (question_id) => {
	try {
		return await courseQuestionComments.findAll({
			where: { question_id },
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT ifnull(name,email) as name FROM users WHERE `users`.`id` = `course_questions_comments`.`created_by`)'
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

exports.addCourseQuestionComments = async (data) => {
	console.log(data)
	const newData = await courseQuestionComments.create(data)
	return newData
}

module.exports.getcourseQuestionLikes = async (question_id) => {
	try {
		return await courseQuestionLike.findAll({
			where: { question_id },
		})
	} catch (err) {
		console.log(err)
		return false
	}
}

exports.courseQuestionLike = async (data) => {
	console.log(data)
	const newData = await courseQuestionLike.create(data)
	return newData
}

exports.lectureLikeDislike = async (data) => {
	console.log(data)
	const newData = await lectureLikeDislikes.create(data)
	return newData
}

exports.updatelectureLikeDislike = async (
	lecture_id,
	user_id,
	like_dislike
) => {
	try {
		const data = await courseAnnouncements.update(
			{
				like_dislike,
			},
			{
				where: {
					lecture_id,
					user_id,
				},
			}
		)
		return data
	} catch (err) {
		return false
	}
}

module.exports.getUserLectureLikeDislike = async (lecture_id, user_id) => {
	try {
		return await lectureLikeDislikes.findOne({
			where: { lecture_id, user_id },
		})
	} catch (err) {
		console.log(err)
		return false
	}
}

module.exports.getcourseAnnouncements = async (course_id) => {
	try {
		return await courseAnnouncements.findAll({
			where: { course_id },
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT ifnull(name,email) as name FROM users WHERE `users`.`id` = `course_announcements`.`created_by`)'
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

exports.addAnnouncement = async (data) => {
	console.log(data)
	const newData = await courseAnnouncements.create(data)
	return newData
}

exports.updateAnnouncement = async (id, title, description) => {
	try {
		const data = await courseAnnouncements.update(
			{
				title,
				description,
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

exports.addCourseAnnouncementComments = async (data) => {
	console.log(data)
	const newData = await courseAnnouncementComments.create(data)
	return newData
}

module.exports.getAnnouncementComments = async (announcement_id) => {
	try {
		return await courseAnnouncementComments.findAll({
			where: { announcement_id },
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT name FROM users WHERE `users`.`id` = `course_announcements_comments`.`created_by`)'
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

module.exports.getCourseNotes = async (course_id, created_by) => {
	try {
		return await courseNotes.findAll({
			where: { course_id, created_by },
		})
	} catch (err) {
		console.log(err)
		return false
	}
}
exports.AddCourseNotes = async (data) => {
	console.log(data)
	const newData = await courseNotes.create(data)
	return newData
}

module.exports.getQAForAdmin = async (course_id, lecture_id) => {
	try {
		return await courseQuestionAnswers.findAll({
			where: { course_id, lecture_id, is_deleted: 0 },
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT name FROM users WHERE `users`.`id` = `course_questions_answers`.`created_by`)'
						),
						'createdBy_username',
					],
					[
						sequelize.literal(
							'(SELECT email FROM users WHERE `users`.`id` = `course_questions_answers`.`created_by`)'
						),
						'createdBy_email',
					],
					[
						sequelize.literal(
							'(SELECT phone_number FROM users WHERE `users`.`id` = `course_questions_answers`.`created_by`)'
						),
						'createdBy_phone_number',
					],
					[
						sequelize.literal(
							'(SELECT name FROM users WHERE `users`.`id` = `course_questions_answers`.`answered_by`)'
						),
						'answeredBy_username',
					],
				],
			},
		})
	} catch (err) {
		console.log(err)
		return false
	}
}
