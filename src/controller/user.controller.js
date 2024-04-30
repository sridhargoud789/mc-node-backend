const response = require('../helpers/response.helper')
const db = require('../../models')
const userService = require('../dbService/user.service')
const courseService = require('../dbService/course.services')
const examService = require('../dbService/exam.services')
const awsHelper = require('../helpers/aws.helper')
const config = require('../config/config')
const paypalHelper = require('../helpers/paypal.helper')
const web3Helper = require('../helpers/web3.helper')
const coinbaseCommerceHelper = require('../helpers/coinbase.helper')
const moment = require('moment')
const commonHelper = require('../helpers/common.helper')
const commonService = require('../dbService/common.service')
const paymentService = require('../dbService/payment.service')
const stripeHelper = require('../helpers/stripe.helper')
const activeCampagineHelper = require('../helpers/activecampaign')
const logger = require('../config/logger')
const { pinataHelper } = require('../helpers/pinata')
const nftHelper = require('../helpers/nftMint')
const requestIp = require('request-ip')
const googleSheetHelper = require('../helpers/googleSheet.helper')
const mailHelper = require('../helpers/email.helper')

const fs = require('fs')
const { Readable } = require('stream')
const nodeHtmlToImage = require('node-html-to-image')

const editUserProfile = async (req, res, next) => {
	try {
		delete req.body?.password
		await userService.updateUser(req.user.id, req.body)
		return response.helper(
			res,
			true,
			'USER_PROFILE_UPDATED_SUCCESS',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const notficationSettingUpdate = async (req, res, next) => {
	try {
		await userService.updateUserNotificationSetting(req.user.id, req.body)
		return response.helper(
			res,
			true,
			'USER_NOTIFICATION_SETTING_UPDATED',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const privacyPolicyUpdate = async (req, res, next) => {
	try {
		await userService.updateUserPrivacyPolicy(req.user.id, req.body)
		return response.helper(res, true, 'PRIVACY_POLICY_UPDATED', {}, 200)
	} catch (err) {
		next(err)
	}
}
const userInfo = async (req, res, next) => {
	try {
		const { user } = req
		const loginUser = await userService.userLoginData(user.id)
		console.log('user---->', user)
		console.log('loginUser---->', loginUser)
		const userFavCrypto = []
		const userRewardPoints = await userService.calculateUserRewardPoints(
			user.id
		)
		const packageList = await userService.userPackages(req.user.id)
		const userData = {
			id: user.id,
			email: user.email,
			phone_number: user.phone_number,
			date_birth: user.date_birth,
			avatar: user.avatar || '',
			gender: user.gender,
			is_phone_verified: loginUser?.is_phone_verified || 0,
			role: loginUser?.roles.name,
			level_id: loginUser?.levels?.id,
			level_crypto: loginUser?.levels?.name,
			newsletter_name: loginUser?.newsletters?.name,
			newsletter_code: loginUser?.newsletters?.code,
			name: loginUser?.name,
			last_name: loginUser?.last_name,
			address_line1: loginUser?.address_line1,
			address_line2: loginUser?.address_line2,
			state: loginUser?.state,
			country: loginUser?.country,
			fav_cryptos: userFavCrypto,
			notification_settings: loginUser?.notificationSettings,
			un_collected_reward_points: userRewardPoints?.dataValues
				.un_collected_points
				? userRewardPoints?.dataValues.un_collected_points
				: 0,
			request_to_collect_points: userRewardPoints?.dataValues
				.request_to_collect
				? userRewardPoints?.dataValues.request_to_collect
				: 0,
			packageList: packageList || [],
			wallet: await userService.walletData(req.user.id),
			discord_username: loginUser?.discord_username || '',
			insta_user_id: loginUser?.insta_user_id || '',
			employee_company: loginUser?.employee_company || '',
			is_module_1_submitted: loginUser?.is_module_1_submitted || '',
			is_module_2_submitted: loginUser?.is_module_2_submitted || '',
			is_module_3_submitted: loginUser?.is_module_3_submitted || '',
			is_module_4_submitted: loginUser?.is_module_4_submitted || '',
			is_module_5_submitted: loginUser?.is_module_5_submitted || '',
			is_module_6_submitted: loginUser?.is_module_6_submitted || '',
			is_module_7_submitted: loginUser?.is_module_7_submitted || '',
			is_module_8_submitted: loginUser?.is_module_8_submitted || '',
			is_module_9_submitted: loginUser?.is_module_9_submitted || '',
			is_module_10_submitted: loginUser?.is_module_10_submitted || '',
			is_module_11_submitted: loginUser?.is_module_11_submitted || '',
			is_module_12_submitted: loginUser?.is_module_12_submitted || '',
			is_module_13_submitted: loginUser?.is_module_13_submitted || '',
			is_module_14_submitted: loginUser?.is_module_14_submitted || '',
			telegram_username_submitted:
				loginUser?.telegram_username_submitted || '',
		}
		return response.helper(res, true, '_SUCCESS', { userData }, 200)
	} catch (err) {
		next(err)
	}
}

const updateEmployeeType = async (req, res, next) => {
	try {
		const { employee_company } = req.body
		await userService.updateUser(req.user.id, { employee_company })

		return response.helper(
			res,
			true,
			'USER_PROFILE_UPDATED_SUCCESS',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const resetFormModule = async (req, res, next) => {
	try {
		const { form_id, user_id } = req.body
		let data = {}
		if (form_id === 1) {
			data = { is_module_1_submitted: null }
		} else if (form_id === 2) {
			data = { is_module_2_submitted: null }
		} else if (form_id === 3) {
			data = { is_module_3_submitted: null }
		} else if (form_id === 4) {
			data = { is_module_4_submitted: null }
		} else if (form_id === 5) {
			data = { is_module_5_submitted: null }
		} else if (form_id === 6) {
			data = { is_module_6_submitted: null }
		} else if (form_id === 7) {
			data = { is_module_7_submitted: null }
		} else if (form_id === 8) {
			data = { is_module_8_submitted: null }
		} else if (form_id === 9) {
			data = { is_module_9_submitted: null }
		} else if (form_id === 10) {
			data = { is_module_10_submitted: null }
		} else if (form_id === 11) {
			data = { is_module_11_submitted: null }
		} else if (form_id === 12) {
			data = { is_module_12_submitted: null }
		} else if (form_id === 13) {
			data = { is_module_13_submitted: null }
		} else if (form_id === 14) {
			data = { is_module_14_submitted: null }
		}

		await userService.updateUser(user_id, data)

		return response.helper(
			res,
			true,
			'USER_PROFILE_UPDATED_SUCCESS',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}
const resetCompleteModule = async (req, res, next) => {
	try {
		const { user_id } = req.body
		let data = {
			employee_company: null,
			is_module_1_submitted: null,
			is_module_2_submitted: null,
			is_module_3_submitted: null,
			is_module_4_submitted: null,
			is_module_5_submitted: null,
			is_module_6_submitted: null,
			is_module_7_submitted: null,
			is_module_8_submitted: null,
			is_module_9_submitted: null,
			is_module_10_submitted: null,
			is_module_11_submitted: null,
			is_module_12_submitted: null,
			is_module_13_submitted: null,
			is_module_14_submitted: null,
		}

		await userService.updateUser(user_id, data)

		return response.helper(
			res,
			true,
			'USER_PROFILE_UPDATED_SUCCESS',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const updateUserMandate = async (req, res, next) => {
	try {
		await userService.updateUser(req.user.id, req.body)

		return response.helper(
			res,
			true,
			'USER_PROFILE_UPDATED_SUCCESS',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const updateUsertelgramSubmitted = async (req, res, next) => {
	try {
		const { course_id } = req.body

		await courseService.updateUserTelegramSubmission(req.user.id, course_id)

		return response.helper(
			res,
			true,
			'USER_PROFILE_UPDATED_SUCCESS',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const updateDiscodName = async (req, res, next) => {
	try {
		const { discord_username } = req.body
		await userService.updateUser(req.user.id, { discord_username })
		// const userLoginSheet = re
		return response.helper(
			res,
			true,
			'USER_PROFILE_UPDATED_SUCCESS',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const createUser = async (req, res, next) => {
	try {
		return response.helper(res, true, 'LOGIN_SUCCESS', {}, 200)
	} catch (err) {
		next(err)
	}
}

const updateUser = async (req, res, next) => {
	try {
		return response.helper(res, true, 'LOGIN_SUCCESS', {}, 200)
	} catch (err) {
		next(err)
	}
}

const userDetails = async (req, res, next) => {
	try {
		return response.helper(res, true, 'LOGIN_SUCCESS', {}, 200)
	} catch (err) {
		next(err)
	}
}

const deleteUser = async (req, res, next) => {
	try {
		return response.helper(res, true, 'LOGIN_SUCCESS', {}, 200)
	} catch (err) {
		next(err)
	}
}

const resetPassword = async (req, res, next) => {
	try {
		const user = req.user
		const { currentPassword, newPassword } = req.body
		const decryptPassword = commonHelper.decryptString(currentPassword)
		const hash = commonHelper.shaPassword(decryptPassword)
		if (hash != user.password) {
			return response.helper(
				res,
				false,
				'INVALID_CURRENT_PASSWORD',
				{},
				200
			)
		}
		const newDecryptPassword = commonHelper.decryptString(newPassword)
		const newHash = commonHelper.shaPassword(newDecryptPassword)
		await userService.updateUser(user.id, { password: newHash })
		return response.helper(res, true, 'PASSWORD_RESET_SUCCESS', {}, 200)
	} catch (error) {
		next(error)
	}
}

const uploadProfilePic = async (req, res, next) => {
	try {
		const user = req.user
		let uploadImg
		console.log('req.file', req.file)
		if (req.file) {
			const splitDataExt = req.file.originalname.split('.')
			const ext = splitDataExt[splitDataExt.length - 1]
			uploadImg = await awsHelper.fileUpload(
				req.file.buffer,
				`profile_pic`,
				`${user.id}.${ext}`,
				req.file.mimetype,
				config.MS_PUBLIC_S3,
				true
			)
			console.log('upload', uploadImg)
			await userService.updateUser(user.id, {
				avatar: uploadImg?.data?.Location,
			})
		}
		return response.helper(
			res,
			true,
			'PROFILE_UPLOAD_SUCCESS',
			{ url: uploadImg?.data?.Location },
			200
		)
	} catch (error) {
		next(error)
	}
}

const courseToCart = async (req, res, next) => {
	try {
		const { courseId } = req.body
		const data = await courseService.checkInCart(courseId, req.user.id)
		if (data) {
			return response.helper(res, false, 'COUSER_ALREADY_CART', {}, 200)
		}
		const isCoursePurchased = await userService.userCoursePurchased(
			req.user.id,
			courseId
		)
		if (isCoursePurchased) {
			return response.helper(res, false, 'COUSER_ALREADY_CART', {}, 200)
		}
		await courseService.addToCart(courseId, req.user.id)
		return response.helper(res, true, 'COURSE_ADDED_TO_CART', {}, 200)
	} catch (err) {
		next(err)
	}
}
const userCartList = async (req, res, next) => {
	try {
		const data = await courseService.cartList(req.user.id)
		const userDetails = await userService.getAvailableCoupon(req.user.id)
		const [discount] = userDetails
		let discountDetails
		if (discount) {
			console.log('disount', discount)
			discountDetails = await courseService.discountDetails(
				discount.discount_id
			)
		}
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ courses: data, discounts: discountDetails || {} },
			200
		)
	} catch (err) {
		next(err)
	}
}
const removeToCart = async (req, res, next) => {
	try {
		const { courseId } = req.body
		await courseService.removeToCart(courseId, req.user.id)
		return response.helper(res, true, 'COURSE_REMOVE_TO_CART', {}, 200)
	} catch (err) {
		next(err)
	}
}

const courseToWish = async (req, res, next) => {
	try {
		const { courseId } = req.body
		const data = await courseService.checkInWish(courseId, req.user.id)
		if (data) {
			return response.helper(res, false, 'COUSER_ALREADY_WISH', {}, 200)
		}
		await courseService.addToWish(courseId, req.user.id)
		return response.helper(res, true, 'COURSE_ADDED_TO_WISH', {}, 200)
	} catch (err) {
		next(err)
	}
}
const userWishList = async (req, res, next) => {
	try {
		const data = await courseService.wishList(req.user.id)
		return response.helper(res, true, '_SUCCESS', { courses: data }, 200)
	} catch (err) {
		next(err)
	}
}
const removeToWish = async (req, res, next) => {
	try {
		const { courseId } = req.body
		await courseService.removeToWish(courseId, req.user.id)
		return response.helper(res, true, 'COURSE_REMOVE_TO_WISH', {}, 200)
	} catch (err) {
		next(err)
	}
}

const userCourseInit = async (req, res, next) => {
	try {
		const { courseId } = req.body
		let userId = req.user.id
		const isPublicCourse = await courseService.publicCourseCheck(courseId)
		if (isPublicCourse) {
			if (isPublicCourse.is_course_restricted_to_users) {
				const isCourseAvailableForUser =
					await userService.isUserWhitelisted(req.user.email)
				if (!isCourseAvailableForUser) {
					return response.helper(
						res,
						false,
						'COURSE_NOT_AVAILABLE',
						{},
						200
					)
				}
			}
			const isCourseAlreadyPurchased = await courseService.userCourseData(
				courseId,
				userId
			)
			if (!isCourseAlreadyPurchased) {
				await activeCampagineHelper.addContactToList(
					req.user.active_campagin_id,
					isPublicCourse.active_campagine_list
				)
				const tokenAv = await commonService.calculateTokenAvg()
				const responseData = commonHelper.avgPriceOfMCT(tokenAv)
				const mctAmount = responseData.price

				const historyUser = {
					course_id: courseId,
					user_id: userId,
					stripe_id: 'Public_Course',
					status: 1,
				}
				await courseService.addCourseToUserTransaction(historyUser)
				const [examForCourse] = await courseService.examList(courseId)
				const prepareCourseHistory = {
					course_id: courseId,
					user_id: userId,
					started_at: null,
					purchased_amount: 0, // storing in mct
					reward_amount:
						examForCourse?.reward ||
						process.env.MC_WALLET_REWARD_AMOUNT,
					total_reward_earned: 0,
					mct_price_at_purchase: mctAmount,
					transaction_id: 'Public_Course',
				}
				await courseService.addCourseToUserData(prepareCourseHistory)
			}
		}

		const data = await courseService.courseInitData(
			courseId,
			req.user.id,
			req.headers.language
		)
		if (!data) {
			return response.helper(res, false, 'COURSE_NOT_FOUND', {}, 400)
		}
		const userCourseData = await courseService.userCourseData(
			courseId,
			req.user.id
		)

		let modId
		let lecId
		data.courseModules.forEach((eachModule) => {
			if (userCourseData.last_watch_module == 0 && !modId) {
				modId = eachModule.id
			}
			eachModule.courseLectures.forEach((eachLec) => {
				if (userCourseData.last_watch_lecture == 0 && !lecId) {
					lecId = eachLec.id
				}
				eachLec.documents.forEach((eachDoc) => {
					eachDoc = eachDoc
				})
				eachLec = eachLec
			})
			eachModule = eachModule
		})
		const moduleWithLecList = {}
		data.courseModules.forEach((eachModule) => {
			let len = 0
			eachModule.courseLectures.forEach((eachL) => {
				len++
			})
			moduleWithLecList[`${eachModule.module_index}`] = len
		})
		const moduleId =
			userCourseData.last_watch_module == 0
				? modId
				: userCourseData.last_watch_module
		const lectureId =
			userCourseData.last_watch_lecture == 0
				? lecId
				: userCourseData.last_watch_lecture
		const { nextLecture, nextModule } =
			await courseService.findCurrentAndNextLecture(userCourseData, data)
		let resultModule = await commonHelper.calculateAccessibleModules(
			data,
			req.user.id
		)
		let currentLectureData
		if (courseId && nextModule && nextLecture) {
			if (!resultModule.includes(nextModule)) {
				return response.helper(
					res,
					true,
					'_SUCCESS',
					{
						course: data,
						currentLectureData: currentLectureData
							? currentLectureData
							: null,
						userCourseData,
						availableModules: resultModule,
					},
					200
				)
			}
			console.log(courseId, nextModule, nextLecture)
			currentLectureData = await courseService.currentLecture(
				courseId,
				nextModule,
				nextLecture,
				req.headers.language
			)
			if (req.headers.language) {
				if (currentLectureData?.video_url) {
					let splitLecUrl = currentLectureData?.video_url.split('/')
					splitLecUrl.splice(1, 0, 'en')
					currentLectureData.video_url = splitLecUrl.join('/')
				}
			}

			if (currentLectureData?.video_url) {
				currentLectureData.video_url = encodeURI(
					`https://${config.MS_TUTORIAL_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/${currentLectureData.video_url}`
				)
				//  await awsHelper.signedByCF(
				// 				moment().add(5, 'm'),
				// 				encodeURIComponent(currentLectureData.video_url)
				// 			)
			}
			data.courseModules.forEach((eachModule) => {
				if (eachModule.id == currentLectureData?.module_id) {
					currentLectureData.dataValues.module_name = eachModule.name
				}
			})
		}
		const totalExams = await examService.getExamList(courseId)
		const examList = []
		totalExams.forEach((eachE) => {
			examList.push(eachE.id)
		})
		const userExamHistory = await examService.getExamDetailsByList(
			examList,
			req.user.id
		)
		console.log(totalExams)
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{
				course: data,
				currentLectureData: currentLectureData
					? currentLectureData
					: null,
				userCourseData,
				availableModules: resultModule,
				userExamHistory,
			},
			200
		)
	} catch (err) {
		next(err)
	}
}

const userLectureVideoAccess = async (req, res, next) => {
	try {
		const { courseId, moduleId, lectureId } = req.body
		const data = await courseService.courseInitData(
			courseId,
			req.user.id,
			req.headers.language
		)
		let resultModule = await commonHelper.calculateAccessibleModules(
			data,
			req.user.id
		)
		// if (!resultModule.includes(moduleId)) {
		// 	return response.helper(res, true, '_SUCCESS', null, 200)
		// }
		const currentLectureData = await courseService.currentLecture(
			courseId,
			moduleId,
			lectureId,
			req.headers.language
		)
		if (req.headers.language) {
			if (currentLectureData?.video_url) {
				let splitLecUrl = currentLectureData?.video_url.split('/')
				splitLecUrl.splice(1, 0, 'en')
				currentLectureData.video_url = splitLecUrl.join('/')
			}
		}
		currentLectureData.video_url = encodeURI(
			`https://${config.MS_TUTORIAL_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/${currentLectureData.video_url}`
		)
		// await awsHelper.signedByCF(
		// 	moment().add(5, 'm'),
		// 	encodeURIComponent(currentLectureData.video_url)
		// )
		return response.helper(res, true, '_SUCCESS', currentLectureData, 200)
	} catch (err) {
		next(err)
	}
}

const updateUserLastWatchCourse = async (req, res, next) => {
	try {
		const { userCourseHistoryId, moduleId, lectureId, videoDuration } =
			req.body
		await userService.updateUserLastWatch(
			userCourseHistoryId,
			moduleId,
			lectureId,
			videoDuration
		)
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ userCourseHistoryId, moduleId, lectureId, videoDuration },
			200
		)
	} catch (err) {
		next(err)
	}
}

// const purchaseCourseStripe = async (req, res, next) => {
// 	try {
// 		const { courseId } = req.body
// 		const isCourseWithSameName = await courseService.courseDetails(
// 			courseId,
// 			'id'
// 		)
// 		if (!isCourseWithSameName) {
// 			return response.helper(res, false, 'COURSE_NOT_FOUND', {}, 200)
// 		}
// 		const isCourseAlreadyPurchased = await courseService.userCoursesDetails(
// 			courseId,
// 			req.user.id
// 		)
// 		if (isCourseAlreadyPurchased) {
// 			return response.helper(
// 				res,
// 				false,
// 				'COURSE_ALREADY_PURCHASED',
// 				{},
// 				200
// 			)
// 		}
// 		const courseUserTransactionData = {
// 			course_id: courseId,
// 			user_id: req.user.id,
// 			status: 1,
// 		}
// 		await courseService.addCourseToUserTransaction(
// 			courseUserTransactionData
// 		)
// 		const prepareCourseHistory = {
// 			course_id: courseId,
// 			user_id: req.user.id,
// 			started_at: moment().format('YYYY-MM-DD HH:MM:SS'),
// 			purchased_amount: isCourseWithSameName.price,
// 			reward_amount:
// 				isCourseWithSameName.price +
// 				(isCourseWithSameName.price * 20) / 100,
// 			total_reward_earned: 0,
// 		}
// 		await courseService.addCourseToUserData(prepareCourseHistory)
// 		return response.helper(res, true, '_SUCCESS', {}, 200)
// 	} catch (err) {
// 		next(err)
// 	}
// }

const checkOutCart = async (req, res, next) => {
	try {
		const {
			isCoinbase,
			isCreditCard,
			isMCTToken,
			first_name,
			last_name,
			phone_number,
			address_line_1,
			address_line_2,
			state,
			country,
			zip_code,
			isShippingSame,
			isSave,
			source_url,
			cancel_url,
			transaction_id,
			courseIdList,
			isStripe,
			isCoursePack,
			isWalletPay,
			packId,
			referalUser,
			referalCode,
			checkOutWithMc,
			purchase_amount_usd,
			sales_agent,
		} = req.body
		logger.checkOutData(`Cart checkout api ${JSON.stringify(req.body)}`)

		let address_id = req.body.address_id
		const userObj = await userService.userDetails(req.user.id)
		const userDetails = await userService.getAvailableCoupon(req.user.id)
		const [discount] = userDetails
		let referralCodeDetails
		let discountDetails

		const calculatedMctPrice = await commonService.calculateTokenAvg()
		const mctP = await commonHelper.avgPriceOfMCT(calculatedMctPrice)
		const mctPriceAtPurchase = mctP.price
		const walletData = await userService.walletData(req.user.id)

		// check for discount details
		if (discount) {
			discountDetails = await courseService.discountDetails(
				discount.discount_id
			)
		}

		// check for referral code details
		if (referalCode) {
			referralCodeDetails = await userService.referralCodeData({
				code: referalCode,
			})
		}

		// mcttoken transaction validation
		if (isMCTToken && transaction_id && transaction_id != '') {
			const trnasactionData = await web3Helper.getTransactionHashData(
				transaction_id
			)
			if (trnasactionData) {
				const { to, status } = trnasactionData
				if (!status) {
					return response.helper(
						res,
						false,
						'TRANSACTION_VALIDATION_FAILED',
						{},
						200
					)
				}
				if (to != config.OWNER_WALLET_ADDRESS) {
					return response.helper(
						res,
						false,
						'TRANSACTION_VALIDATION_FAILED',
						{},
						200
					)
				}
			} else {
				return response.helper(
					res,
					false,
					'TRANSACTION_VALIDATION_FAILED',
					{},
					200
				)
			}
		}

		// save address for future use
		if (isSave) {
			const addressData = await userService.saveAddress({
				first_name,
				last_name,
				phone_number,
				address_line_1,
				address_line_2,
				state,
				country,
				zip_code,
				user_id: req.user.id,
			})
			address_id = addressData.id
		}

		// check for package purchase
		if (isCoursePack) {
			/**
			 * Buy course Pack
			 */
			const packData = await courseService.packageDetails(packId)
			if (!packData) {
				return response.helper(
					res,
					false,
					'PACKAGE_DETAILS_NOT_FOUND',
					{},
					400
				)
			}

			// total amount in usd
			const totalAmount = {
				currency: 'USD',
				total: packData.price,
			}
			// check if user already purchased course or not
			const isPackAlreadyPurchased =
				await courseService.isUserPurchasedPack(req.user.id, packId)
			if (isPackAlreadyPurchased) {
				return response.helper(res, true, 'CHECKOUT_SUCCESS', {}, 200)
			}
			// define course user data for package
			const packageUserTransactionData = {
				package_id: packId,
				user_id: req.user.id,
				referal_user_id: referalUser,
				user_ip: requestIp.getClientIp(req),
			}
			// if user purchased discount then added discount coupon id
			if (discountDetails) {
				packageUserTransactionData.used_discount_id = discountDetails.id
			}
			// add course user data
			const userPackage = await courseService.addCourseToUserTransaction(
				packageUserTransactionData
			)

			let paypalData
			const responseData = {}
			const itemList = [
				{
					name: packData.name,
					sku: packData.name,
					price: packData.price,
					currency: isMCTToken ? 'MCT' : 'USD',
					quantity: 1,
				},
			]
			if (isCreditCard) {
				const paymentData = {
					item_list: {
						items: itemList,
					},
					amount: totalAmount,
					description: 'Checkout With Paypal',
					source_url,
				}
				paypalData = await paypalHelper.payment(paymentData)
				await courseService.userCourseUpdate(
					userPackage.dataValues.id,
					{
						paypal_id: paypalData.id,
						address_id: address_id,
					}
				)
				const [url] = paypalData?.links.filter(
					(data) => data.method == 'REDIRECT'
				)
				responseData.redirectUrl = url.href
			} else if (isCoinbase) {
				if (discountDetails) {
					totalAmount.total =
						totalAmount.total - discountDetails.discount_amount
				}
				if (checkOutWithMc) {
					let walletAmountInDlr =
						walletData.token_balance > 0
							? walletData.token_balance * mctPriceAtPurchase
							: 0
					walletAmountInDlr = walletAmountInDlr.toFixed(0)
					console.log(walletAmountInDlr)
					totalAmount.total = totalAmount.total - walletAmountInDlr
				}
				const paymentData = {
					item_list: {
						items: itemList,
					},
					amount: totalAmount,
					description: 'Checkout With Coinbase',
					discount: discountDetails,
				}
				coinbaseData = await coinbaseCommerceHelper.createCharge(
					paymentData
				)
				await courseService.userCourseUpdate(
					userPackage.dataValues.id,
					{
						coinbase_id: coinbaseData.code,
						address_id: address_id,
						...(checkOutWithMc && {
							mc_amount: walletData.token_balance,
							mct_price: mctPriceAtPurchase,
						}),
					}
				)
				responseData.redirectUrl = coinbaseData.hosted_url
			} else if (isMCTToken) {
				/**
				 * Mct Payment Start
				 */
				const userId = req.user.id
				const calculatedMctPrice =
					await commonService.calculateTokenAvg()
				const mctP = await commonHelper.avgPriceOfMCT(
					calculatedMctPrice
				)
				const mctPriceAtPurchase = mctP.price
				const isTransactionHashExist =
					await courseService.isTransactionExist(transaction_id)

				const finalAmount = 0
				if (!isTransactionHashExist) {
					const coursesList = packData.course_ids.split(',')
					const newCourseArr = []
					coursesList.forEach((eachCourse) => {
						const temp = {
							user_id: req.user.id,
							course_id: eachCourse,
						}
						newCourseArr.push(temp)
					})

					for (let i = 0; i < newCourseArr.length; i++) {
						const courseId = newCourseArr[i].course_id
						const isCourseWithSameName = packData
						if (!isCourseWithSameName) {
							continue
						}
						const isCourseAlreadyPurchased =
							await courseService.userCoursesDetails(
								courseId,
								userId
							)
						if (isCourseAlreadyPurchased) {
							continue
						}
						const purchasedAmount = packData.price / 7
						const prepareCourseHistory = {
							course_id: courseId,
							user_id: userId,
							started_at: null,
							purchased_amount: Number(
								purchasedAmount / mctPriceAtPurchase
							).toFixed(2),
							reward_amount:
								purchasedAmount / mctPriceAtPurchase +
								(purchasedAmount / mctPriceAtPurchase) * 0.2,
							total_reward_earned: 0,
							mct_price_at_purchase: mctPriceAtPurchase,
							transaction_id,
						}
						await courseService.addCourseToUserData(
							prepareCourseHistory
						)
					}
					await courseService.addCourseToUserTransaction({
						package_id: packData.id,
						user_id: req.user.id,
						transaction_id,
						status: 1,
						...(discountDetails && {
							used_discount_id: discountDetails.id,
						}),
						user_ip: requestIp.getClientIp(req),
						purchase_amount_usd,
					})
					await courseService.addUserTransaction({
						user_id: userId,
						transaction_id,
						amount: packData.price / mctPriceAtPurchase,
						payment_with: 'mct',
						...(discountDetails && {
							used_discount_id: discountDetails.id,
						}),
					})
					await commonHelper.purchaseMail(req.user.id)
					if (discountDetails?.id) {
						await courseService.updateDiscountIdMarktAsUsed(
							discountDetails.id,
							userId
						)
					} else {
						if (userObj.dataValues.active_campagin_id) {
							await activeCampagineHelper.addTagsToContact(
								userObj.dataValues.active_campagin_id,
								config.PACKAGE_ID
							)
							await activeCampagineHelper.addContactToList(
								userObj.dataValues.active_campagin_id,
								config.PACKAGE_LIST
							)
						}
					}
				}
				/**
				 * Mct payment end
				 */
			} else if (isStripe) {
				const paymentData = {
					successUrl: source_url,
					cancelUrl: cancel_url,
					listItems: [
						{
							price: packData.stripe_price_id,
							quantity: 1,
						},
					],
					mode: 'payment',
				}
				// check if discount have than add coupon code to stripe payment
				if (discountDetails) {
					paymentData.discounts = [
						{
							coupon: discountDetails.stripe_coupon_id,
						},
					]
				}

				if (checkOutWithMc) {
					let walletAmountInDlr =
						walletData.token_balance > 0
							? walletData.token_balance * mctPriceAtPurchase
							: 0
					walletAmountInDlr = walletAmountInDlr.toFixed(0)
					if (walletAmountInDlr > 0) {
						console.log('courseId--->', courseId)
						let finalDlr =
							courseId === 55
								? 288 * mctPriceAtPurchase
								: walletAmountInDlr
						console.log('finalDlr--->', finalDlr)
						const oneTimeCouponCode =
							await stripeHelper.createCoupon({
								amount: finalDlr,
								durationType: 'once',
							})
						paymentData.discounts = [
							{
								coupon: oneTimeCouponCode.id,
							},
						]
					}
					totalAmount.total =
						totalAmount.total -
						(courseId === 55
							? 288 * mctPriceAtPurchase
							: walletAmountInDlr)
				}

				const stripeCheckoutData = await stripeHelper.createCheckout(
					paymentData
				)
				// add stripe payment id to course user table
				await courseService.userCourseUpdate(
					userPackage.dataValues.id,
					{
						stripe_id: stripeCheckoutData.payment_intent,
						address_id: address_id,
						...(checkOutWithMc && {
							mc_amount: walletData.token_balance,
							mct_price: mctPriceAtPurchase,
						}),
					}
				)
				responseData.redirectUrl = stripeCheckoutData.url
			} else if (isWalletPay) {
				/**
				 * Wallet Payment Start
				 */
				const userId = req.user.id
				const calculatedMctPrice =
					await commonService.calculateTokenAvg()
				const mctP = await commonHelper.avgPriceOfMCT(
					calculatedMctPrice
				)
				const mctPriceAtPurchase = mctP.price
				const wallet_pay_id = await commonHelper.generateUId()
				const checkWalletAmount = await userService.walletData(userId)
				let finalAmount = Number(
					packData.price / mctPriceAtPurchase
				).toFixed()

				if (wallet_pay_id) {
					const coursesList = packData.course_ids.split(',')
					const newCourseArr = []
					coursesList.forEach((eachCourse) => {
						const temp = {
							user_id: req.user.id,
							course_id: eachCourse,
						}
						newCourseArr.push(temp)
					})

					for (let i = 0; i < newCourseArr.length; i++) {
						const courseId = newCourseArr[i].course_id
						const isCourseWithSameName = packData
						if (!isCourseWithSameName) {
							continue
						}
						const isCourseAlreadyPurchased =
							await courseService.userCoursesDetails(
								courseId,
								userId
							)
						if (isCourseAlreadyPurchased) {
							continue
						}
						const purchasedAmount = packData.price / 7
						const prepareCourseHistory = {
							course_id: courseId,
							user_id: userId,
							started_at: null,
							purchased_amount: Number(
								purchasedAmount / mctPriceAtPurchase
							).toFixed(2),
							reward_amount:
								purchasedAmount / mctPriceAtPurchase +
								(purchasedAmount / mctPriceAtPurchase) * 0.2,
							total_reward_earned: 0,
							mct_price_at_purchase: mctPriceAtPurchase,
							transaction_id,
						}
						await courseService.addCourseToUserData(
							prepareCourseHistory
						)
					}
					await courseService.addUserTransaction({
						user_id: userId,
						transaction_id: wallet_pay_id,
						amount: finalAmount,
						payment_with: 'wallet_pay',
						...(discountDetails && {
							used_discount_id: discountDetails.id,
						}),
					})
					await userService.deductMctFromWallet(req.user.id, {
						token_balance:
							checkWalletAmount.token_balance - finalAmount,
					})
					if (userObj.dataValues.active_campagin_id) {
						await activeCampagineHelper.addContactToList(
							userObj.dataValues.active_campagin_id,
							config.PACKAGE_LIST
						)
					}
				}

				/**
				 * Wallet payment end
				 */
			}
			return response.helper(
				res,
				true,
				'CHECKOUT_SUCCESS',
				responseData,
				200
			)

			/**
			 * End Buy Course Pack
			 */
		} else {
			// check cart courses
			const cartCourse = await userService.userCartCourses(req.user.id)
			const itemList = []
			const stripeIdList = []
			const totalAmount = {
				currency: 'USD',
				total: 0,
			}
			const courseHistoryList = []
			for (let i = 0; i < cartCourse.length; i++) {
				const courseId = cartCourse[i].course_id
				// check course exist or not
				const isCourseWithSameName = await courseService.courseDetails(
					courseId,
					'id'
				)
				if (!isCourseWithSameName) continue
				// check for course already purchased or not
				const isCourseAlreadyPurchased =
					await courseService.userCoursesDetails(
						courseId,
						req.user.id
					)
				if (isCourseAlreadyPurchased) continue

				stripeIdList.push({
					price: isCourseWithSameName.stripe_price_id,
					quantity: 1,
				})
				const itemData = {
					name: isCourseWithSameName.name,
					sku: isCourseWithSameName.slug,
					price: isMCTToken
						? isCourseWithSameName.mct_amount
						: isCourseWithSameName.price,
					currency: isMCTToken ? 'MCT' : 'USD',
					quantity: 1,
					courseId,
				}
				totalAmount.total += isCourseWithSameName.price
				itemList.push(itemData)
				const courseUserTransactionData = {
					course_id: courseId,
					user_id: req.user.id,
					referal_user_id: referalUser,
					user_ip: requestIp.getClientIp(req),
					purchase_amount_usd,
					sales_agent,
				}
				if (discountDetails) {
					courseUserTransactionData.used_discount_id =
						discountDetails.id
				}
				if (isMCTToken) {
					courseUserTransactionData.transaction_id = transaction_id
				} else {
					const userCourse =
						await courseService.addCourseToUserTransaction(
							courseUserTransactionData
						)
					courseHistoryList.push(userCourse)
				}
			}
			let paypalData
			const responseData = {}

			if (isCreditCard) {
				const paymentData = {
					item_list: {
						items: itemList,
					},
					amount: totalAmount,
					description: 'Checkout With Paypal',
					source_url,
				}
				paypalData = await paypalHelper.payment(paymentData)
				for (let i = 0; i < courseHistoryList.length; i++) {
					await courseService.userCourseUpdate(
						courseHistoryList[i].dataValues.id,
						{
							paypal_id: paypalData.id,
							address_id: address_id,
						}
					)
				}
				const [url] = paypalData?.links.filter(
					(data) => data.method == 'REDIRECT'
				)
				responseData.redirectUrl = url.href
			} else if (isCoinbase) {
				// added discount on total pack
				let referralUsed = false
				if (discountDetails) {
					totalAmount.total =
						totalAmount.total - discountDetails.discount_amount
				}
				if (
					referralCodeDetails &&
					itemList.length == 1 &&
					itemList[0].courseId == referralCodeDetails.course_id
				) {
					referralUsed = true
					const discount =
						(totalAmount.total *
							referralCodeDetails.discount_percentage) /
						100
					totalAmount.total = totalAmount.total - discount
					console.log(discount)
					discountDetails = referralCodeDetails
				}

				if (checkOutWithMc) {
					let walletAmountInDlr =
						walletData.token_balance > 0
							? walletData.token_balance * mctPriceAtPurchase
							: 0
					walletAmountInDlr = walletAmountInDlr.toFixed(0)
					console.log(walletAmountInDlr)
					totalAmount.total =
						totalAmount.total -
						(itemList[0].courseId === 55 ? 288 : walletAmountInDlr)
				}
				const paymentData = {
					item_list: {
						items: itemList,
					},
					amount: totalAmount,
					description: 'Checkout With Coinbase',
					discount: discountDetails,
				}

				coinbaseData = await coinbaseCommerceHelper.createCharge(
					paymentData
				)
				for (let i = 0; i < courseHistoryList.length; i++) {
					await courseService.userCourseUpdate(
						courseHistoryList[i].dataValues.id,
						{
							coinbase_id: coinbaseData.code,
							address_id: address_id,
							...(referralUsed && {
								referral_code: referralCodeDetails.id,
							}),
							...(checkOutWithMc && {
								mc_amount: walletData.token_balance,
								mct_price: mctPriceAtPurchase,
							}),
						}
					)
				}
				responseData.redirectUrl = coinbaseData.hosted_url
			} else if (isMCTToken) {
				/**
				 * Mct Payment Start
				 */
				const userId = req.user.id
				const isTransactionHashExist =
					await courseService.isTransactionExist(transaction_id)
				let finalAmount = 0
				if (!isTransactionHashExist) {
					for (let i = 0; i < courseIdList.length; i++) {
						const courseId = courseIdList[i]
						const isCourseWithSameName =
							await courseService.courseDetails(courseId, 'id')
						if (!isCourseWithSameName) {
							continue
						}

						const isCourseAlreadyPurchased =
							await courseService.userCoursesDetails(
								courseId,
								userId
							)
						if (isCourseAlreadyPurchased) {
							continue
						}
						const courseUserTransactionData = {
							course_id: courseId,
							user_id: userId,
							transaction_id,
							status: 1,
							...(discountDetails && {
								used_discount_id: discountDetails.id,
							}),
							user_ip: requestIp.getClientIp(req),
							purchase_amount_usd,
							...(checkOutWithMc && {
								mc_amount: walletData.token_balance,
								mct_price: mctPriceAtPurchase,
							}),
							sales_agent,
						}
						await courseService.addCourseToUserTransaction(
							courseUserTransactionData
						)
						const dpurchase_amount_usd =
							parseFloat(purchase_amount_usd)
						const prepareCourseHistory = {
							course_id: courseId,
							user_id: userId,
							started_at: null,
							purchased_amount: Number(
								dpurchase_amount_usd / mctPriceAtPurchase
							).toFixed(2),
							reward_amount:
								dpurchase_amount_usd / mctPriceAtPurchase +
								(dpurchase_amount_usd / mctPriceAtPurchase) *
									0.2,
							total_reward_earned: 0,
							mct_price_at_purchase: mctPriceAtPurchase,
							transaction_id,
						}
						await activeCampagineHelper.addTagsToContact(
							userObj.dataValues.active_campagin_id,
							isCourseWithSameName.active_campagine_tag
						)

						await courseService.addCourseToUserData(
							prepareCourseHistory
						)

						await courseService.removeToCart(courseId, userId)
						if (courseId === 55) {
							await commonHelper.purchaseDineroDesbloqueadoMail(
								userId
							)
						}
						finalAmount +=
							isCourseWithSameName.price / mctPriceAtPurchase
					}
					if (checkOutWithMc) {
						await userService.deductMctFromWallet(userId, {
							token_balance: 0,
						})
						await userService.addWalletHistory({
							user_id: userId,
							amount: walletData.token_balance,
							transaction_type: 'debit',
						})
					}

					await courseService.addUserTransaction({
						user_id: userId,
						transaction_id,
						amount: finalAmount,
						payment_with: 'mct',
						...(discountDetails && {
							used_discount_id: discountDetails.id,
						}),
					})
					if (discountDetails?.id) {
						await courseService.updateDiscountIdMarktAsUsed(
							discountDetails.id,
							userId
						)
					}

					if (userObj.dataValues.active_campagin_id) {
						await activeCampagineHelper.addContactToList(
							userObj.dataValues.active_campagin_id,
							config.PACKAGE_LIST
						)
					}
				}

				/**
				 * Mct payment end
				 */
			} else if (isStripe) {
				let referralUsed = false
				const paymentData = {
					successUrl: source_url,
					cancelUrl: cancel_url,
					listItems: stripeIdList,
					mode: 'payment',
				}
				if (discountDetails) {
					paymentData.discounts = [
						{
							coupon: discountDetails.stripe_coupon_id,
						},
					]
				}
				if (
					referralCodeDetails &&
					itemList.length == 1 &&
					itemList[0].courseId == referralCodeDetails.course_id
				) {
					referralUsed = true
					paymentData.discounts = [
						{
							coupon: referralCodeDetails.stripe_discount_id,
						},
					]
				}

				if (checkOutWithMc) {
					let walletAmountInDlr =
						walletData.token_balance > 0
							? walletData.token_balance * mctPriceAtPurchase
							: 0
					walletAmountInDlr = walletAmountInDlr.toFixed(0)
					if (walletAmountInDlr > 0) {
						console.log(itemList[0].courseId)
						let finalDlr = parseFloat(
							itemList[0].courseId === 55
								? 288
								: walletAmountInDlr
						).toFixed(0)
						console.log(
							'mctPriceAtPurchase---->',
							mctPriceAtPurchase
						)
						console.log('walletAmountInDlr---->', walletAmountInDlr)

						console.log('finalDlr---->', finalDlr)

						if (referralUsed) {
							const referralCoupon = await stripeHelper.getCoupon(
								referralCodeDetails.stripe_discount_id
							)
							finalDlr =
								Number(finalDlr) +
								Number(referralCoupon.amount_off) / 100
							console.log(
								finalDlr,
								Number(referralCoupon.amount_off) / 100
							)
						}
						const oneTimeCouponCode =
							await stripeHelper.createCoupon({
								amount: finalDlr,
								durationType: 'once',
							})
						paymentData.discounts = [
							{
								coupon: oneTimeCouponCode.id,
							},
						]
					}
					totalAmount.total =
						totalAmount.total -
						(itemList[0].courseId === 55
							? 288 * mctPriceAtPurchase
							: walletAmountInDlr)
				}

				const stripeCheckoutData = await stripeHelper.createCheckout(
					paymentData
				)
				for (let i = 0; i < courseHistoryList.length; i++) {
					await courseService.userCourseUpdate(
						courseHistoryList[i].dataValues.id,
						{
							stripe_id: stripeCheckoutData.payment_intent,
							address_id: address_id,
							...(referralUsed && {
								referral_code: referralCodeDetails.id,
							}),
							...(checkOutWithMc && {
								mc_amount: walletData.token_balance,
								mct_price: mctPriceAtPurchase,
							}),
						}
					)
				}
				responseData.redirectUrl = stripeCheckoutData.url
			} else if (isWalletPay) {
				/**
				 * Wallet Payment Start
				 */
				const userId = req.user.id
				const calculatedMctPrice =
					await commonService.calculateTokenAvg()
				const mctP = await commonHelper.avgPriceOfMCT(
					calculatedMctPrice
				)
				const mctPriceAtPurchase = mctP.price
				const wallet_pay_id = await commonHelper.generateUId()
				const checkWalletAmount = await userService.walletData(userId)
				let finalAmount = 0
				if (wallet_pay_id) {
					console.log('cartCourse', cartCourse)
					for (let i = 0; i < cartCourse.length; i++) {
						const courseId = cartCourse[i].course_id
						const isCourseWithSameName =
							await courseService.courseDetails(courseId, 'id')
						finalAmount +=
							isCourseWithSameName.price / mctPriceAtPurchase
					}

					if (!(checkWalletAmount.token_balance >= finalAmount)) {
						return response.helper(
							res,
							false,
							'INSUFFICIENT_BALANCE',
							{},
							400
						)
					}
					for (let i = 0; i < cartCourse.length; i++) {
						const courseId = cartCourse[i].course_id
						const isCourseWithSameName =
							await courseService.courseDetails(courseId, 'id')
						if (!isCourseWithSameName) {
							continue
						}

						const isCourseAlreadyPurchased =
							await courseService.userCoursesDetails(
								courseId,
								userId
							)
						if (isCourseAlreadyPurchased) {
							continue
						}
						const courseUserTransactionData = {
							course_id: courseId,
							user_id: userId,
							wallet_pay_id,
							status: 1,
							purchase_amount_usd,
							...(discountDetails && {
								used_discount_id: discountDetails.id,
							}),
							sales_agent,
						}
						await courseService.addCourseToUserTransaction(
							courseUserTransactionData
						)
						const prepareCourseHistory = {
							course_id: courseId,
							user_id: userId,
							started_at: null,
							purchased_amount: Number(
								isCourseWithSameName.price / mctPriceAtPurchase
							).toFixed(2),
							reward_amount:
								isCourseWithSameName.price /
									mctPriceAtPurchase +
								(isCourseWithSameName.price /
									mctPriceAtPurchase) *
									0.2,
							total_reward_earned: 0,
							mct_price_at_purchase: mctPriceAtPurchase,
							transaction_id: wallet_pay_id,
						}
						await activeCampagineHelper.addTagsToContact(
							userObj.dataValues.active_campagin_id,
							isCourseWithSameName.active_campagine_tag
						)

						await courseService.addCourseToUserData(
							prepareCourseHistory
						)
						await courseService.removeToCart(courseId, userId)
						if (courseId === 55) {
							await commonHelper.purchaseDineroDesbloqueadoMail(
								userId
							)
						}
					}

					await courseService.addUserTransaction({
						user_id: userId,
						transaction_id: wallet_pay_id,
						amount: finalAmount,
						payment_with: 'wallet_pay',
						...(discountDetails && {
							used_discount_id: discountDetails.id,
						}),
					})
					await userService.deductMctFromWallet(req.user.id, {
						token_balance:
							checkWalletAmount.token_balance - finalAmount,
					})
					if (discountDetails?.id) {
						await courseService.updateDiscountIdMarktAsUsed(
							discountDetails.id,
							userId
						)
					}
					if (userObj.dataValues.active_campagin_id) {
						await activeCampagineHelper.addContactToList(
							userObj.dataValues.active_campagin_id,
							config.PACKAGE_LIST
						)
					}
				}

				/**
				 * Wallet payment end
				 */
			}
			return response.helper(
				res,
				true,
				'CHECKOUT_SUCCESS',
				responseData,
				200
			)
		}
	} catch (err) {
		next(err)
	}
}

const requestForCourseExam = async (req, res, next) => {
	try {
		const { courseId, moduleId } = req.body
		const lastExamByUser = await userService.userRequestExamByCourse(
			req.user.id,
			courseId
		)
		const courseDetails = await courseService.courseDetails(courseId, 'id')
		const examModule = lastExamByUser?.completed_exam_ids
			? await lastExamByUser.completed_exam_ids.split(',')
			: []
		examModule.forEach((exam) => {
			exam = Number(exam)
		})
		const moduleList = await courseService.moduleListWithExam(courseId)
		const moduleObj = {}
		let lastModule
		moduleList.forEach((eachMod) => {
			moduleObj[`${eachMod.id}`] = eachMod.examData?.id
		})
		const firstExam = moduleList[0]?.examData?.id

		if (
			lastExamByUser?.completed_md_ids == null &&
			!courseDetails.is_public
		) {
			return response.helper(res, true, '_SUCCESS', { exam: null }, 200)
		} else {
			const completedModuleArr =
				lastExamByUser?.completed_md_ids?.split(',')
			if (completedModuleArr) {
				let isExamCompleted = false
				completedModuleArr.forEach((ele) => {
					if (ele == moduleId) {
						const examId = Number(moduleObj[`${moduleId}`])
						if (examModule.includes(examId)) {
							isExamCompleted = true
						}
					}
				})
				if (isExamCompleted) {
					return response.helper(
						res,
						true,
						'_SUCCESS',
						{ exam: null },
						200
					)
				}
			}
			if (!courseDetails.is_public) {
				lastModule = completedModuleArr[completedModuleArr.length - 1]
			}
		}
		let nextExam = moduleId
			? moduleObj[`${moduleId}`]
			: lastModule != undefined
			? moduleObj[`${lastModule}`]
			: firstExam
		if (courseDetails.is_public) {
			if (examModule.length == 0 && !nextExam) {
				nextExam = firstExam
			}
		}

		if (!nextExam && !moduleId) {
			const lastCheckForExam = await examService.checkExamCompletedOrNot(
				moduleObj,
				lastExamByUser?.completed_md_ids?.split(','),
				lastExamByUser?.completed_exam_ids?.split(',')
			)
			if (lastCheckForExam) {
				nextExam = lastCheckForExam
			} else {
				return response.helper(
					res,
					true,
					'_SUCCESS',
					{ exam: null },
					200
				)
			}
		}
		const examData = nextExam ? await userService.examData(nextExam) : null
		const questions = []
		if (examData) {
			for (let i = 0; i < examData?.shuffleQuestions?.length; i++) {
				const questionData = await examService.getQuestion(
					nextExam,
					examData.shuffleQuestions[i].shuffle_index,
					req.headers.language
				)
				if (questionData.length) {
					questions.push(questionData[0].questions)
				}
			}
			examData.dataValues.questions = questions
		}
		return response.helper(res, true, '_SUCCESS', { exam: examData }, 200)
	} catch (err) {
		console.log('err', err)
		next(err)
	}
}
const requestForExamStart = async (req, res, next) => {
	try {
		const { examId } = req.body
		const isExamAlreadyStarted = await examService.examAlreadyStarted(
			req.user.id,
			examId
		)
		if (isExamAlreadyStarted) {
			return response.helper(res, false, 'EXAM_ALREADY_STARTED', {}, 200)
		}
		const examData = await examService.courseDataByExam(examId)
		const courseDetails = await courseService.courseDetails(
			examData.course_id,
			'id'
		)
		const examPublicList = []
		if (courseDetails.is_public) {
			examPublicList.push('mc_wallet')
			examPublicList.push('doller')
		}
		const totalExamForCourse = await examService.examListByCourse(
			examData.course_id
		)
		const historyUserCourseData = await courseService.userCourseData(
			examData.course_id,
			req.user.id
		)
		const rewardForExam = commonHelper.calculateRewardAmount(
			historyUserCourseData,
			totalExamForCourse.length
		)

		// historyUserCourseData.reward_amount / totalExamForCourse.length;
		const data = await examService.startExam(
			req.user.id,
			examId,
			rewardForExam,
			...examPublicList
		)
		return response.helper(res, true, '_SUCCESS', { exam: data }, 200)
	} catch (err) {
		next(err)
	}
}

const submitExamAns = async (req, res, next) => {
	try {
		let { examId, questionId, userAnswer } = req.body
		userAnswer = userAnswer.trim()
		const isAlreadyAnswered = await examService.checkIsAnswered(
			questionId,
			req.user.id,
			examId
		)
		if (isAlreadyAnswered) {
			return response.helper(res, false, 'IS_ALREADY_ANSWERRED', {}, 200)
		}
		const answeredShuffleQuestion =
			await examService.checkIsShuffleQuestionAnswered(
				questionId,
				examId,
				req.user.id
			)
		if (answeredShuffleQuestion) {
			return response.helper(res, false, 'IS_ALREADY_ANSWERRED', {}, 200)
		}

		const questionData = await examService.questionDetails(questionId)

		const is_correct = userAnswer == questionData.correct_answer ? 1 : 0
		const userQueAnswer = {
			exam_id: examId,
			user_id: req.user.id,
			question_id: questionId,
			question: questionData.question,
			option1: questionData.option1,
			option2: questionData.option2,
			option3: questionData.option3,
			option4: questionData.option4,
			correct_answer: questionData.correct_answer,
			user_answer: userAnswer,
			is_correct,
		}
		const userQuestionAnswerData = await examService.addUserAnsToDb(
			userQueAnswer
		)
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ question: userQuestionAnswerData },
			200
		)
	} catch (err) {
		next(err)
	}
}

const completeExam = async (req, res, next) => {
	try {
		const userId = req.user.id
		const { examId, moduleId, isProctoringFair } = req.body
		const isExamStarted = await examService.isExamStarted(examId, userId)
		if (!isExamStarted) {
			return response.helper(res, false, 'EXAM_NOT_FOUND', {}, 200)
		}
		const examData = await examService.courseDataByExam(examId)
		const courseDetails = await courseService.courseDetails(
			examData.course_id,
			'id'
		)

		const userCourseData = await userService.userRequestExamByCourse(
			req.user.id,
			examData.course_id
		)
		const updateUserCourseData = {}
		if (userCourseData.completed_exam_ids == null) {
			updateUserCourseData.completed_exam_ids = `${examId}`
		} else {
			const splitArr = userCourseData?.completed_exam_ids.split(',')
			let isExist = false
			splitArr.forEach((eachX) => {
				if (eachX == examId) {
					isExist = true
				}
			})
			updateUserCourseData.completed_exam_ids = isExist
				? userCourseData.completed_exam_ids
				: `${userCourseData.completed_exam_ids},${examId}`
		}
		await courseService.updateUserCourseData(
			userCourseData.id,
			updateUserCourseData
		)
		await examService.endExam(examId, userId)
		const courseModuleExamData = await examService.userExamData(
			examId,
			req.user.id
		)
		const userQuestionData = await examService.questionData(examId, userId)
		let correctAns = 0
		const totalQue = userQuestionData.length
		const perQueReward = Number(
			(courseModuleExamData.exam_reward || 1) / totalQue
		).toFixed(2)
		userQuestionData.forEach((eachQ) => {
			if (eachQ.is_correct) {
				correctAns++
			}
		})
		const totalReward = courseModuleExamData.exam_reward || 1
		//correctAns > 0 ? Number(perQueReward * correctAns).toFixed(2) : 0
		let questionAnsData = await examService.userQuestionAnsResult(
			examId,
			req.user.id
		)
		let percentage = 0
		if (questionAnsData) {
			questionAnsData = questionAnsData.dataValues
			percentage =
				questionAnsData.correct_answers > 0
					? Number(
							(questionAnsData.correct_answers * 100) /
								(questionAnsData.correct_answers +
									questionAnsData.wrong_answers)
					  ).toFixed(2)
					: 0
		}
		const passPercentageCritaria =
			courseDetails.id === 38 ? 75 : courseDetails.is_public ? 50 : 70
		const examUserDataToUpdate = {
			reword_points:
				courseDetails.id === 38
					? 0
					: percentage >= passPercentageCritaria && isProctoringFair
					? totalReward
					: 0,
			percentage,
			is_passed:
				percentage >= passPercentageCritaria && isProctoringFair
					? 1
					: 0,
		}
		console.log(req.user)
		if (courseDetails.is_public) {
			await mailHelper.sendEmail({
				type: 'claim-mc-reward',
				data: {
					email: req.user.email,
					FRONT_DOMAIN: process.env.FRONT_DOMAIN,
					username: req.user.name,
				},
			})

			// 	if(examUserDataToUpdate.is_passed) {
			// 		const userWalletDetails = await userService.walletData(userId);
			// 		await userService.deductMctFromWallet(userId, {
			// 			token_balance: userWalletDetails.token_balance + examUserDataToUpdate.reword_points
			// 		});
			// 		await userService.addWalletHistory({
			// 			user_id: userId,
			// 			amount: examUserDataToUpdate.reword_points,
			// 			transaction_type: 'credit',
			// 		})
			// 		examUserDataToUpdate.is_point_collected = 1;
			// 	}
		}
		await examService.updateUserExamData(
			examId,
			userId,
			examUserDataToUpdate
		)
		const userExamData = await examService.userExamData(examId, userId)
		const startTime = moment(userExamData.start_time)
		const endTime = moment(userExamData.completed_time)
		const diff = moment.duration(endTime.diff(startTime))
		const min = diff.asMinutes()
		return response.helper(
			res,
			true,
			'EXAM_END_SUCCESSFULLY',
			{ data: userExamData, examTotalTime: min },
			200
		)
	} catch (err) {
		next(err)
	}
}

const listMyCourses = async (req, res, next) => {
	try {
		const userCourses = await courseService.listUserCourses(
			req.user.id,
			req.headers.language
		)
		for (let i = 0; i < userCourses.length; i++) {
			const userCourse = userCourses[i]
			if (userCourse) {
				userCourse.purchaseData =
					await courseService.userCoursesDetails(
						userCourse.course_id,
						userCourse.user_id
					)
			}
			userCourses[i].dataValues.purchaseData = userCourse.purchaseData
			if (userCourse.courseData?.is_public) {
				userCourse.nftPurchase =
					await paymentService.nftPurchaseDetailsByUserCourse(
						req.user.id,
						userCourse.course_id
					)
				userCourses[i].dataValues.nftPurchase = userCourse.nftPurchase
			}
		}
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ list: userCourses },
			200
		)
	} catch (err) {
		next(err)
	}
}

const endLectureController = async (req, res, next) => {
	try {
		const { lectureId, courseId } = req.body
		const userId = req.user.id
		const courseData = await courseService.courseInitData(courseId, 'id')
		const lectureData = await courseService.lectureDetails(lectureId, 'id')
		const userCourseData = await courseService.userCourseData(
			courseId,
			userId
		)
		const maxLectureInMoudle = await courseService.lastLectureOfModule(
			courseId,
			lectureData.module_id
		)
		const updateUser = {
			completed_lec_ids: lectureId,
		}
		if (userCourseData.completed_lec_ids != null) {
			const list = userCourseData.completed_lec_ids.split(',')
			let isExist = false
			list.forEach((eachL) => {
				if (eachL == lectureId) {
					isExist = true
				}
			})
			updateUser.completed_lec_ids = isExist
				? userCourseData.completed_lec_ids
				: `${userCourseData.completed_lec_ids},${lectureId}`
		}
		if (maxLectureInMoudle?.id == lectureId) {
			const completed_md_ids = maxLectureInMoudle.module_id
			if (userCourseData.completed_md_ids != null) {
				const list = userCourseData.completed_md_ids.split(',')
				let isExist = false
				list.forEach((eachM) => {
					if (eachM == completed_md_ids) {
						isExist = true
					}
				})
				updateUser.completed_md_ids = isExist
					? updateUser.completed_md_ids
					: `${userCourseData.completed_md_ids},${completed_md_ids}`
			} else {
				updateUser.completed_md_ids = completed_md_ids
			}
		}
		const completedLectures = String(updateUser.completed_lec_ids).split(
			','
		)
		const courseLectureArray = []
		const moduleObj = {}
		const lectureObj = {}

		courseData.courseModules.forEach((eachModule) => {
			moduleObj[`${eachModule.id}`] = []
			eachModule.courseLectures.forEach((eachLecture) => {
				lectureObj[`${eachLecture.id}`] = eachModule.id
				moduleObj[`${eachModule.id}`].push(eachLecture.id)
				courseLectureArray.push(eachLecture.id)
			})
		})
		const currentLecModule = lectureObj[`${lectureId}`]
		const currentModule = moduleObj[`${currentLecModule}`]
		const completedLecture = completedLectures.filter(
			(e) => currentModule.includes(Number(e)) == true
		)
		const progress = Number(
			(completedLectures.length * 100) / courseLectureArray.length
		).toFixed(2)
		const moduleProgress = Number(
			(completedLecture.length * 100) / currentModule.length
		).toFixed(2)
		if (progress >= 100) {
			updateUser.completed_at = updateUser.completed_at
				? updateUser.completed_at
				: moment().utc().toDate()
		}
		updateUser.progress = progress
		const dbModuleProgress = userCourseData.module_progress
			? JSON.parse(userCourseData.module_progress)
			: {}
		dbModuleProgress[`${currentLecModule}`] = moduleProgress
		updateUser.module_progress = JSON.stringify(dbModuleProgress)
		await courseService.updateUserCourseData(userCourseData.id, updateUser)

		const updatedUserCourseData = await courseService.userCourseData(
			courseId,
			userId
		)
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ data: updatedUserCourseData },
			200
		)
	} catch (err) {
		next(err)
	}
}

const userExamResult = async (req, res, next) => {
	try {
		const { examId } = req.body
		const userExamData = await examService.userExamData(examId, req.user.id)
		if (userExamData) {
			const questionAnsData = await examService.userQuestionAnsResult(
				examId,
				req.user.id
			)
			const startTime = moment(userExamData.start_time)
			const endTime = moment(userExamData.completed_time)
			const diff = moment.duration(endTime.diff(startTime))
			const min = diff.asMinutes()

			return response.helper(
				res,
				true,
				'_SUCCESS',
				{ data: userExamData, questionAnsData, examTotalTime: min },
				200
			)
		} else {
			return response.helper(
				res,
				false,
				'USER_EXAM_DETAILS_NOT_FOUND',
				{},
				200
			)
		}
	} catch (err) {
		next(err)
	}
}

const checkPaymentStatus = async (req, res, next) => {
	try {
		const { paymentId } = req.body
		try {
			const paypalData = await paypalHelper.getPaymentDetails(paymentId)
			if (paypalData) {
				const cartCourse =
					await courseService.getCourseListPayedByPaypal()
				for (let i = 0; i < cartCourse.length; i++) {
					const courseId = cartCourse[i].course_id
					const isCourseWithSameName =
						await courseService.courseDetails(courseId, 'id')
					if (!isCourseWithSameName) {
						continue
					}

					const isCourseAlreadyPurchased =
						await courseService.userCoursesDetails(
							courseId,
							req.user.id
						)
					if (isCourseAlreadyPurchased) {
						continue
					}
					const itemData = {
						name: isCourseWithSameName.name,
						sku: isCourseWithSameName.slug,
						price: isCourseWithSameName.price,
						currency: 'USD',
						quantity: 1,
					}
					totalAmount.total += isCourseWithSameName.price
					itemList.push(itemData)
					const courseUserTransactionData = {
						course_id: courseId,
						user_id: req.user.id,
						user_ip: requestIp.getClientIp(req),
					}
					const userCourse =
						await courseService.addCourseToUserTransaction(
							courseUserTransactionData
						)
					courseHistoryList.push(userCourse)
					const prepareCourseHistory = {
						course_id: courseId,
						user_id: req.user.id,
						started_at: moment().format('YYYY-MM-DD'),
						purchased_amount: isCourseWithSameName.price,
						reward_amount:
							isCourseWithSameName.price +
							(isCourseWithSameName.price * 20) / 100,
						total_reward_earned: 0,
					}
				}
			}
		} catch (err) {}
		return response.helper(res, true, '_SUCCESS', { data }, 200)
	} catch (err) {
		next(err)
	}
}

const usersAddressList = async (req, res, next) => {
	try {
		const data = await userService.addressList(req.user.id)
		return response.helper(res, true, '_SUCCESS', { data }, 200)
	} catch (err) {
		next(err)
	}
}

const userRemoveAddress = async (req, res, next) => {
	try {
		const { addressId } = req.body
		await userService.removeAddress(addressId)
		return response.helper(
			res,
			true,
			'ADDRESS_REMOVED_SUCCESSFULLY',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const claimUserReward = async (req, res, next) => {
	try {
		const userId = req.user.id
		await examService.clainReward(userId)
		return response.helper(
			res,
			true,
			'REWARD_CLAIMED_SUCCESSFULLY',
			{},
			200
		)
	} catch (err) {
		next(err)
	}
}

const makeUserWalletDefault = async (req, res, next) => {
	try {
		const { walletAddress } = req.body
		await userService.makeWalletDefault(req.user.id, walletAddress)
		return response.helper(res, true, 'WALLET_SET_DEFAULT', {}, 200)
	} catch (err) {
		next(err)
	}
}

const verifyWalletAndLink = async (req, res, next) => {
	try {
		const { walletAddress, signature, chainId } = req.body
		const isWalletCorrect = await web3Helper.validateUserToWallet(
			walletAddress,
			signature,
			chainId,
			req.headers.language
		)
		if (isWalletCorrect) {
			const isWalletAddressExist =
				await userService.userDetailsByWalletAddress(walletAddress)
			if (isWalletAddressExist?.dataValues.email == req.user.email) {
				return response.helper(res, true, '_SUCCESS', {}, 200)
			} else if (isWalletAddressExist) {
				return response.helper(
					res,
					false,
					'WALLET_IS_ALREADY_LINKED_WITH_EMAIL',
					{},
					200
				)
			}
			const isUserWalletDefault =
				await userService.isUserHaveDefaultWallet(req.user.id)
			const userWalletCount = await userService.walletList(req.user.id)
			if (userWalletCount.length < 5) {
				const userData = await userService.saveUserWalletAddress(
					req.user.id,
					walletAddress,
					isUserWalletDefault
				)
				return response.helper(
					res,
					true,
					'WALLET_ADDRESS_LINKED_SUCCESSFULLY',
					{ data: userData },
					200
				)
			} else {
				return response.helper(
					res,
					false,
					'WALLET_LIMIT_REACHED',
					{},
					200
				)
			}
		} else {
			return response.helper(
				res,
				false,
				'WALLET_DETAILS_NOT_VERIFIED',
				{},
				200
			)
		}
	} catch (err) {
		next(err)
	}
}

const verifyPaypalOrder = async (req, res, next) => {
	try {
		const { paymentId } = req.body
		const paypalData = await paypalHelper
			.getPaymentDetails(paymentId)
			.catch((err) => false)
		const responseData = {}
		let totalAmount = 0
		let payment_with = ''
		if (paypalData && paypalData?.payer?.status === 'VERIFIED') {
			payment_with = 'paypal'
			const cartCourse = await courseService.getCourseListPayedByPaypal({
				paypal_id: paymentId,
			})
			for (let i = 0; i < cartCourse.length; i++) {
				const courseId = cartCourse[i].course_id
				const isCourseWithSameName = await courseService.courseDetails(
					courseId,
					'id'
				)
				if (!isCourseWithSameName) {
					continue
				}
				const isCourseAlreadyPurchased =
					await courseService.userCoursesDetails(
						courseId,
						req.user.id
					)
				if (isCourseAlreadyPurchased) {
					continue
				}

				totalAmount += isCourseWithSameName.price
				await courseService.userCourseUpdate(cartCourse[i].id, {
					status: 1,
				})
				const prepareCourseHistory = {
					course_id: courseId,
					user_id: req.user.id,
					started_at: moment().format('YYYY-MM-DD'),
					purchased_amount: isCourseWithSameName.price,
					reward_amount:
						isCourseWithSameName.price +
						(isCourseWithSameName.price * 20) / 100,
					total_reward_earned: 0,
				}
				await courseService.addCourseToUserData(prepareCourseHistory)
				await courseService.removeToCart(courseId, req.user.id)
			}
			if (totalAmount) {
				await courseService.addUserTransaction({
					user_id: req.user.id,
					transaction_id: paymentId,
					amount: totalAmount,
					payment_with,
				})
			}
		}

		if (!(paypalData && paypalData?.payer?.status === 'VERIFIED')) {
			const coinbaseData = await coinbaseCommerceHelper.getChargeData(
				paymentId
			)
			let isConfim = false
			coinbaseData.payments.forEach((payment) => {
				if (payment.status === 'CONFIRMED') {
					isConfim = true
				}
			})
			if (isConfim) {
				payment_with = 'coinbase'
				const cartCourse =
					await courseService.getCourseListCoinbaseCommerce(paymentId)
				for (let i = 0; i < cartCourse.length; i++) {
					const courseId = cartCourse[i].course_id
					const isCourseWithSameName =
						await courseService.courseDetails(courseId, 'id')
					if (!isCourseWithSameName) {
						continue
					}
					const isCourseAlreadyPurchased =
						await courseService.userCoursesDetails(
							courseId,
							req.user.id
						)
					if (isCourseAlreadyPurchased) {
						continue
					}

					totalAmount += isCourseWithSameName.price
					await courseService.userCourseUpdate(cartCourse[i].id, {
						status: 1,
					})
					const prepareCourseHistory = {
						course_id: courseId,
						user_id: req.user.id,
						started_at: moment().format('YYYY-MM-DD'),
						purchased_amount: isCourseWithSameName.price,
						reward_amount:
							isCourseWithSameName.price +
							(isCourseWithSameName.price * 20) / 100,
						total_reward_earned: 0,
					}
					await courseService.addCourseToUserData(
						prepareCourseHistory
					)
					await courseService.removeToCart(courseId, req.user.id)
				}
				if (totalAmount) {
					await courseService.addUserTransaction({
						user_id: req.user.id,
						transaction_id: paymentId,
						amount: totalAmount,
						payment_with,
					})
				}
			}
		}
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ totalAmount, paymentId },
			200
		)
	} catch (err) {
		next(err)
	}
}

const listUserWallets = async (req, res, next) => {
	try {
		const data = await userService.walletList(req.user.id)
		return response.helper(res, true, '_SUCCESS', { data }, 200)
	} catch (err) {
		next(err)
	}
}

const removeWalletFromUser = async (req, res, next) => {
	try {
		const { walletAddress } = req.body
		const data = await userService.removeWalletAddress(walletAddress)
		return response.helper(
			res,
			true,
			'WALLET_UNLINKED_SUCCESSFULLY',
			{ data },
			200
		)
	} catch (err) {
		next(err)
	}
}

const invoiceList = async (req, res, next) => {
	try {
		const data = await userService.invcoices(req.user.id)
		return response.helper(res, true, '_SUCCESS', { data }, 200)
	} catch (err) {
		next(err)
	}
}

const linkEmailToWallet = async (req, res, next) => {
	try {
		const {
			email,
			password,
			adult,
			accept_private_policy,
			phone_number,
			name,
		} = req.body
		const { user } = req
		const checkIsExist = await userService.isEmailExist(email)
		await commonHelper.signupConfirmEmailDataHelper(
			req.user.id,
			email,
			name
		)
		if (checkIsExist) {
			return response.helper(res, false, 'EMAIL_ALREADY_EXIST', {}, 200)
		}
		const decryptPassword = commonHelper.decryptString(password)
		const hash = commonHelper.shaPassword(decryptPassword)
		const level = await userService.levelDetailsByCode('PRI')
		const activeCampagineData = {
			contact: {
				email,
				firstName: name,
				phone: phone_number,
			},
		}

		let activeCampagineUserId
		try {
			const activeCampagineUserExist =
				await activeCampagineHelper.contectFetchByEmail(email)
			if (
				activeCampagineUserExist &&
				activeCampagineUserExist?.data?.contacts?.length
			) {
				const [activeCampagineUser] =
					activeCampagineUserExist.data.contacts
				activeCampagineUserId = activeCampagineUser.id
			} else {
				const {
					data: {
						contact: { id },
					},
				} = await activeCampagineHelper.createContact(
					activeCampagineData
				)
				activeCampagineUserId = id
			}

			await activeCampagineHelper.addContactToList(activeCampagineUserId)
		} catch (err) {
			logger.error('error in active campagine')
		}
		const userData = {
			name,
			email,
			password: hash,
			adult,
			accept_private_policy,
			phone_number,
			level_id: level.id,
			active_campagin_id: activeCampagineUserId,
		}

		const userD = await userService.updateUser(user.id, userData)
		return response.helper(res, true, 'EMAIL_LINKED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const isCourseAlreadyBought = async (req, res, next) => {
	try {
		const { isPack, courseId } = req.body
		let userCourseData
		if (isPack) {
			userCourseData = await courseService.isUserPurchasedPack(
				req.user.id,
				courseId
			)
		} else {
			userCourseData = await courseService.userCoursesDetails(
				courseId,
				req.user.id
			)
		}
		return response.helper(res, true, '_SUCCESS', { userCourseData }, 200)
	} catch (err) {
		next(err)
	}
}

const earlyChekout = async (req, res, next) => {
	try {
		const {
			isCoinbase,
			isCreditCard,
			isMCTToken,
			first_name,
			last_name,
			phone_number,
			address_line_1,
			address_line_2,
			state,
			country,
			zip_code,
			isShippingSame,
			isSave,
			source_url,
			cancel_url,
			transaction_id,
			courseIdList,
			isStripe,
			isCoursePack,
			packId,
			referalUser,
		} = req.body

		let address_id = req.body.address_id
		const couponId = 1

		if (isSave) {
			const addressData = await userService.saveAddress({
				first_name,
				last_name,
				phone_number,
				address_line_1,
				address_line_2,
				state,
				country,
				zip_code,
				user_id: req.user.id,
			})
			address_id = addressData.id
		}

		/**
		 * Buy course Pack
		 */
		const discountDetails = await courseService.discountDetails(
			couponId,
			'id'
		)
		if (!discountDetails) {
			return response.helper(
				res,
				false,
				'PACKAGE_DETAILS_NOT_FOUND',
				{},
				400
			)
		}
		const totalAmount = {
			currency: 'USD',
			total: discountDetails.discount_amount,
		}
		const isCouponAlreadyPurchased = await courseService.isCouponPurchased(
			req.user.id,
			couponId
		)
		if (isCouponAlreadyPurchased) {
			return response.helper(res, true, 'CHECKOUT_SUCCESS', {}, 200)
		}
		const packageUserTransactionData = {
			discount_id: couponId,
			user_id: req.user.id,
			referal_user_id: referalUser,
			user_ip: requestIp.getClientIp(req),
		}
		const userPackage = await courseService.addCourseToUserTransaction(
			packageUserTransactionData
		)

		let paypalData
		const responseData = {}
		const itemList = [
			{
				name: discountDetails.name,
				sku: discountDetails.name,
				price: discountDetails.discount_amount,
				currency: isMCTToken ? 'MCT' : 'USD',
				quantity: 1,
			},
		]
		if (isCoinbase) {
			const paymentData = {
				item_list: {
					items: itemList,
				},
				amount: totalAmount,
				description: 'Checkout With Coinbase',
			}
			coinbaseData = await coinbaseCommerceHelper.createCharge(
				paymentData
			)
			await courseService.userCourseUpdate(userPackage.dataValues.id, {
				coinbase_id: coinbaseData.code,
				address_id: address_id,
			})
			responseData.redirectUrl = coinbaseData.hosted_url
		} else if (isStripe) {
			const paymentData = {
				successUrl: source_url,
				cancelUrl: cancel_url,
				listItems: [
					{
						price: discountDetails.stripe_price_id,
						quantity: 1,
					},
				],
				mode: 'payment',
			}
			const stripeCheckoutData = await stripeHelper.createCheckout(
				paymentData
			)
			await courseService.userCourseUpdate(userPackage.dataValues.id, {
				stripe_id: stripeCheckoutData.payment_intent,
				address_id: address_id,
			})
			responseData.redirectUrl = stripeCheckoutData.url
		}
		return response.helper(res, true, 'CHECKOUT_SUCCESS', responseData, 200)

		/**
		 * End Buy Course Pack
		 */
	} catch (err) {
		next(err)
	}
}

const addActiveCampagineTalkToExpert = async (req, res, next) => {
	try {
		const {
			user: { id, active_campagin_id },
		} = req
		await activeCampagineHelper.addTagsToContact(
			active_campagin_id,
			config.TALK_TO_EXPERT
		)
		return response.helper(res, true, '', {}, 200)
	} catch (err) {
		next(err)
	}
}

const validateUserTransaction = async (req, res, next) => {
	try {
		const { transaction_id } = req.body
		const trnasactionData = await web3Helper.getTransactionHashData(
			transaction_id
		)
		return response.helper(res, true, '', trnasactionData, 200)
	} catch (err) {
		next(err)
	}
}

const startCourseRequest = async (req, res, next) => {
	try {
		const { courseId } = req.body
		const userCourseData = await userService.userRequestExamByCourse(
			req.user.id,
			courseId
		)
		if (!userCourseData) {
			return response.helper(res, false, '', {}, 200)
		}
		if (userCourseData.started_at) {
			return response.helper(
				res,
				false,
				'COURSE_ALREADY_STARTED',
				{},
				200
			)
		}

		const courseData = await courseService.courseDetails(courseId, 'id')
		const historyUserCourseData = await courseService.userCourseData(
			courseId,
			req.user.id
		)
		const rewardAmount = commonHelper.calculateRewardPercentage(
			historyUserCourseData.mct_price_at_purchase,
			courseData.price
		)
		// await courseService.updateUserCourseData(historyUserCourseData.id, {
		// 	reward_amount: rewardAmount
		// });
		if (courseData.duration) {
			if (courseData.duration <= 15) {
				exam_end_time = moment().add('30', 'days').utc().toDate()
			} else if (courseData.duration > 15 && courseData.duration <= 30) {
				exam_end_time = moment().add('60', 'days').utc().toDate()
			} else {
				exam_end_time = moment().add('120', 'days').utc().toDate()
			}
		}
		console.log({
			started_at: moment().utc().toDate(),
			exam_available_expiry_time: exam_end_time,
		})
		await userService.updateCourseHistory(userCourseData.id, {
			started_at: moment().utc().toDate(),
			exam_available_expiry_time: exam_end_time,
		})
		return response.helper(res, true, 'COURSE_STARTED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const mintUserNFT = async (req, res, next) => {
	try {
		const { courseId } = req.body
		const courseData = await courseService.courseDetails(courseId, 'id')
		if (!courseData) {
			response.helper(res, false, 'COURSE_NOT_FOUND', {}, 200)
		}
		const userCourseHistory = await courseService.userCourseData(
			courseId,
			req.user.id
		)
		if (!userCourseHistory?.is_nft_minted) {
			const userWalletDetails = await userService.isUserHaveDefaultWallet(
				req.user.id
			)
			const duration =
				userCourseHistory.completed_at == userCourseHistory.started_at
					? null
					: commonHelper.duration(
							userCourseHistory.started_at,
							userCourseHistory.completed_at
					  )
			const nftData = {
				courseName: courseData.name,
				courseDescription:
					courseData.description || courseData.sub_title,
				username: userWalletDetails?.wallet_address,
				duration: `${courseData.duration} Hours`,
			}
			const pinataResponse = await pinataHelper(nftData)
			console.log(pinataResponse)
			const nftTransactionResponse = await nftHelper.mintNFT(
				[userWalletDetails?.wallet_address],
				[pinataResponse.IpfsHash]
			)
			pinataResponse.nft_id = Number(
				nftTransactionResponse.logs[0].topics[3]
			)
			await courseService.updateUserCourseData(userCourseHistory.id, {
				nft_data: pinataResponse,
				is_nft_minted: 1,
			})
			return response.helper(res, true, 'NFT_MINTED', {}, 200)
		} else {
			return response.helper(res, true, 'NFT_ALREADY_MINTED', {}, 200)
		}
	} catch (err) {
		next(err)
	}
}

const downloadUserNFT = async (req, res, next) => {
	try {
		const { courseId } = req.body
		const courseData = await courseService.courseDetails(courseId, 'id')
		if (!courseData) {
			response.helper(res, false, 'COURSE_NOT_FOUND', {}, 200)
		}

		const userCourseHistory = await courseService.userCourseData(
			courseId,
			req.user.id
		)
		const htmlPath = global.project_dir + '/certificate/certificate.html'
		const today =
			userCourseHistory.completed_at === null
				? new Date()
				: new Date(userCourseHistory.completed_at)
		const yyyy = today.getFullYear()
		let mm = today.getMonth() + 1 // Months start at 0
		let dd = today.getDate()

		if (dd < 10) dd = '0' + dd
		if (mm < 10) mm = '0' + mm

		const formattedToday = dd + '/' + mm + '/' + yyyy
		let html = fs.readFileSync(htmlPath, 'utf-8')

		// @todo update dynamically
		html = html.replace('$courseName', courseData.name)
		html = html.replace('$userName', req.user.name)
		html = html.replace('$completionTime', formattedToday)
		html = html.replace('$duration', `${courseData.duration} Hours`)

		const updatedHtml = html

		const image = await nodeHtmlToImage({
			html: updatedHtml,
		})

		const b64 = new Buffer(image).toString('base64')
		return response.helper(res, true, 'NFT_MINTED', { data: b64 }, 200)
	} catch (err) {
		next(err)
	}
}

const saveUserReport = async (req, res, next) => {
	try {
		const { exam_id, report_data, report_shared_url, ci_score, ci_index } =
			req.body
		const examDetails = await examService.courseDataByExam(exam_id)
		if (!examDetails) {
			return response.helper(res, true, 'EXAM_NOT_FOUND', {}, 200)
		}
		const reportData = await examService.saveExamReportData({
			exam_id,
			module_id: examDetails.module_id,
			course_id: examDetails.course_id,
			report_data,
			report_shared_url,
			ci_score,
			ci_index,
			user_id: req.user.id,
		})
		return response.helper(res, true, 'EXAM_REPORT_SAVED', reportData, 200)
	} catch (err) {
		logger.error(`Error in save user report api ${err}`)
		next(err)
	}
}

const completeCourseReuqest = async (req, res, next) => {
	try {
		const { courseId } = req.body
		const courseData = await courseService.courseDetails(courseId, 'id')
		if (!courseData) {
			response.helper(res, false, 'COURSE_NOT_FOUND', {}, 200)
		}
		const userCourseHistory = await courseService.userCourseData(
			courseId,
			req.user.id
		)
		const updateData = {
			completed_at: moment().utc().toDate(),
		}
		await courseService.updateUserCourseData(
			userCourseHistory.id,
			updateData
		)
		return response.helper(res, true, 'COURSE_COMPLETED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const partialCheckout = async (req, res, next) => {
	try {
		let {
			isCoinbase,
			isCreditCard,
			isMCTToken,
			isStripe,
			transaction_id,
			course_id,
			first_name,
			last_name,
			phone_number,
			address_line_1,
			address_line_2,
			state,
			country,
			zip_code,
			isShippingSame,
			isSave,
			source_url,
			cancel_url,
			referalUser,
			partialTime,
			purchsedId,
			isFullPay,
		} = req.body
		logger.checkOutData(`Partial checkout api ${JSON.stringify(req.body)}`)
		let address_id = req.body.address_id
		const userObj = await userService.userDetails(req.user.id)
		const userId = req.user.id
		const courseDetails = await courseService.courseDetails(course_id, 'id')
		if (!courseDetails.is_partial_payment_available) {
			return response.helper(
				res,
				false,
				'PARTIAL_PAYMENT_NOT_AVAILABLE',
				{},
				200
			)
		}
		const calculatedMctPrice = await commonService.calculateTokenAvg()
		const mctP = await commonHelper.avgPriceOfMCT(calculatedMctPrice)
		const mctPriceAtPurchase = mctP.price

		if (isMCTToken && transaction_id && transaction_id != '') {
			const trnasactionData = await web3Helper.getTransactionHashData(
				transaction_id
			)
			if (trnasactionData) {
				const { to, status } = trnasactionData
				if (!status) {
					return response.helper(
						res,
						false,
						'TRANSACTION_VALIDATION_FAILED',
						{},
						200
					)
				}
				if (to != config.OWNER_WALLET_ADDRESS) {
					return response.helper(
						res,
						false,
						'TRANSACTION_VALIDATION_FAILED',
						{},
						200
					)
				}
			} else {
				return response.helper(
					res,
					false,
					'TRANSACTION_VALIDATION_FAILED',
					{},
					200
				)
			}
		}

		if (isSave) {
			const addressData = await userService.saveAddress({
				first_name,
				last_name,
				phone_number,
				address_line_1,
				address_line_2,
				state,
				country,
				zip_code,
				user_id: req.user.id,
			})
			address_id = addressData.id
		}

		const itemList = []
		let stripeIdList = []
		const totalAmount = {
			currency: 'USD',
			total: 0,
		}
		const courseHistoryList = []
		const courseId = course_id
		const isCourseWithSameName = await courseService.courseDetails(
			courseId,
			'id'
		)
		const isCourseAlreadyPurchased = await courseService.userCoursesDetails(
			courseId,
			userId
		)
		if (isCourseAlreadyPurchased) {
			if (isCourseAlreadyPurchased.remian_payments) {
				if (
					purchsedId != isCourseAlreadyPurchased.id &&
					isCourseAlreadyPurchased.is_partial_payment
				) {
					return response.helper(
						res,
						false,
						'INCORRECT_PAYMENT_ID',
						{},
						200
					)
				}
			} else {
				return response.helper(
					res,
					false,
					'COURSE_ALREADY_PURCHASED',
					{},
					200
				)
			}
		}

		let amount =
			Number(
				isCourseWithSameName.split_payment_amounts_obj[`${partialTime}`]
			) || isCourseWithSameName.price / partialTime
		if (courseDetails.partialpay_stripe_price_obj) {
			const stripeProduct = courseDetails.partialpay_stripe_price_obj
				? JSON.parse(courseDetails.partialpay_stripe_price_obj)
				: {}
			const productPrice = partialTime
				? stripeProduct[partialTime]
				: stripeProduct[isCourseAlreadyPurchased.payment_devied_in]
			if (productPrice) {
				stripeIdList.push({
					price: productPrice,
					quantity: 1,
				})
			}
		}
		const itemData = {
			name: isCourseWithSameName.name,
			sku: isCourseWithSameName.slug,
			price: amount,
			currency: isMCTToken ? 'MCT' : 'USD',
			quantity: 1,
		}
		if (isFullPay) {
			itemData.price = amount * isCourseAlreadyPurchased.remian_payments
			amount = itemData.price
		}
		totalAmount.total += amount
		itemList.push(itemData)
		const courseUserTransactionData = {
			course_id: courseId,
			user_id: req.user.id,
			referal_user_id: referalUser,
			is_partial_payment: 1,
			payment_devied_in: partialTime,
			remian_payments: partialTime,
			each_payment_amount: amount,
			user_ip: requestIp.getClientIp(req),
		}
		if (isMCTToken) {
			courseUserTransactionData.transaction_id = transaction_id
		} else {
			console.log('isCourseAlreadyPurchased', isCourseAlreadyPurchased)
			if (!isCourseAlreadyPurchased) {
				const userCourse =
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
				courseHistoryList.push(userCourse)
			} else {
				courseHistoryList.push(isCourseAlreadyPurchased)
			}
		}

		let paypalData
		const responseData = {}

		if (isCreditCard) {
		} else if (isCoinbase) {
			const paymentData = {
				item_list: {
					items: itemList,
				},
				amount: totalAmount,
				description: 'Checkout With Coinbase',
			}
			coinbaseData = await coinbaseCommerceHelper.createCharge(
				paymentData
			)
			for (let i = 0; i < courseHistoryList.length; i++) {
				await courseService.userCourseUpdate(
					courseHistoryList[i].dataValues.id,
					{
						address_id: address_id,
					}
				)
				await paymentService.savePaymentInstallment(
					userId,
					courseId,
					coinbaseData.code,
					amount,
					mctPriceAtPurchase,
					'coinbase',
					'pending',
					isFullPay
				)
			}
			responseData.redirectUrl = coinbaseData.hosted_url
		} else if (isMCTToken) {
			/**
			 * Mct Payment Start
			 */
			const userId = req.user.id

			const isTransactionHashExist =
				await courseService.isTransactionExist(transaction_id)
			let finalAmount = 0
			if (!isTransactionHashExist) {
				let purchaseData = {}
				if (purchsedId) {
					purchaseData = isCourseAlreadyPurchased
					if (purchaseData.remian_payments == 1) {
						await paymentService.savePaymentInstallment(
							userId,
							courseId,
							transaction_id,
							amount,
							mctPriceAtPurchase,
							'mct',
							'success',
							isFullPay
						)
						const savePaymentInstallmentList =
							await paymentService.paymentInstallments(
								courseId,
								userId
							)
						let totalMct = mctPriceAtPurchase
						savePaymentInstallmentList.forEach((eachPayment) => {
							totalMct += eachPayment.mct_amount_on_purchase
						})
						const finalMCTPrice =
							totalMct / purchaseData.payment_devied_in
						const purchaseAmount =
							(amount * purchaseData.payment_devied_in) /
							finalMCTPrice
						const updateCourseHistoryData = {
							mct_price_at_purchase: finalMCTPrice,
							purchased_amount: purchaseAmount,
							reward_amount:
								purchaseAmount + purchaseAmount * 0.2,
						}
						const userCourseHistory =
							await courseService.userCourseData(courseId, userId)
						await courseService.updateUserCourseData(
							userCourseHistory.id,
							updateCourseHistoryData
						)
						await courseService.userCourseUpdate(purchaseData.id, {
							remian_payments: 0,
							next_payment_date: null,
						})
						await courseService.addUserTransaction({
							user_id: userId,
							transaction_id,
							amount: amount / mctPriceAtPurchase,
							payment_with: 'mct',
						})
					} else if (purchaseData.remian_payments > 1) {
						if (isFullPay) {
							amount = amount * purchaseData.remian_payments
							const savePaymentInstallmentList =
								await paymentService.paymentInstallments(
									courseId,
									userId
								)
							let totalMct = mctPriceAtPurchase
							savePaymentInstallmentList.forEach(
								(eachPayment) => {
									totalMct +=
										eachPayment.mct_amount_on_purchase
								}
							)
							const finalMCTPrice =
								totalMct /
								(purchaseData.payment_devied_in -
									purchaseData.remian_payments +
									1)
							const purchaseAmount = amount / finalMCTPrice
							const updateCourseHistoryData = {
								mct_price_at_purchase: finalMCTPrice,
								purchased_amount: purchaseAmount,
								reward_amount:
									purchaseAmount + purchaseAmount * 0.2,
							}
							const userCourseHistory =
								await courseService.userCourseData(
									courseId,
									userId
								)
							await courseService.updateUserCourseData(
								userCourseHistory.id,
								updateCourseHistoryData
							)
						}
						await paymentService.savePaymentInstallment(
							userId,
							courseId,
							transaction_id,
							amount,
							mctPriceAtPurchase,
							'mct',
							'success',
							isFullPay
						)
						await courseService.userCourseUpdate(purchaseData.id, {
							remian_payments: isFullPay
								? 0
								: purchaseData.remian_payments - 1,
							next_payment_date: isFullPay
								? null
								: moment(purchaseData.next_payment_date).add(
										30,
										'days'
								  ),
						})
						await courseService.addUserTransaction({
							user_id: userId,
							transaction_id,
							amount: amount / mctPriceAtPurchase,
							payment_with: 'mct',
						})
					}
				} else {
					const courseId = course_id
					const courseUserTransactionData = {
						course_id: courseId,
						user_id: userId,
						// transaction_id,
						status: 1,
						is_partial_payment: 1,
						payment_devied_in: partialTime,
						remian_payments: partialTime - 1,
						next_payment_date: moment().add(30, 'days'),
						each_payment_amount: amount,
						user_ip: requestIp.getClientIp(req),
						purchase_amount_usd,
					}
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
					const prepareCourseHistory = {
						course_id: courseId,
						user_id: userId,
						started_at: null,
						// purchased_amount: Number(amount / mctPriceAtPurchase).toFixed(2),
						total_reward_earned: 0,
						// mct_price_at_purchase: mctPriceAtPurchase,
						transaction_id,
					}
					await activeCampagineHelper.addTagsToContact(
						userObj.dataValues.active_campagin_id,
						isCourseWithSameName.active_campagine_tag
					)
					await courseService.addCourseToUserData(
						prepareCourseHistory
					)
					await courseService.removeToCart(courseId, userId)
					finalAmount += amount / mctPriceAtPurchase
					await courseService.addUserTransaction({
						user_id: userId,
						transaction_id,
						amount: finalAmount,
						payment_with: 'mct',
					})
					await paymentService.savePaymentInstallment(
						userId,
						courseId,
						transaction_id,
						amount,
						mctPriceAtPurchase,
						'mct',
						'success',
						isFullPay
					)
					if (userObj.dataValues.active_campagin_id) {
						await activeCampagineHelper.addContactToList(
							userObj.dataValues.active_campagin_id,
							config.PACKAGE_LIST
						)
					}
				}
			}

			/**
			 * Mct payment end
			 */
		} else if (isStripe) {
			const stripeIdData = stripeIdList[0]
			let stripeDataIds = []
			if (isFullPay) {
				for (
					let i = 0;
					i < isCourseAlreadyPurchased.remian_payments;
					i++
				) {
					stripeDataIds.push(stripeIdData)
				}
				console.log('stripeDataIds', stripeDataIds)
				stripeIdList = stripeDataIds
			}
			const paymentData = {
				successUrl: source_url,
				cancelUrl: cancel_url,
				listItems: isFullPay ? stripeDataIds : stripeIdList,
				mode: 'payment',
			}
			const stripeCheckoutData = await stripeHelper.createCheckout(
				paymentData
			)
			for (let i = 0; i < courseHistoryList.length; i++) {
				await courseService.userCourseUpdate(
					courseHistoryList[i].dataValues.id,
					{
						stripe_id: stripeCheckoutData.payment_intent,
						address_id: address_id,
					}
				)
				await paymentService.savePaymentInstallment(
					userId,
					courseId,
					stripeCheckoutData.payment_intent,
					amount,
					mctPriceAtPurchase,
					'stripe',
					'pending',
					isFullPay
				)
			}
			responseData.redirectUrl = stripeCheckoutData.url
		}

		return response.helper(res, true, 'CHECKOUT_SUCCESS', responseData, 200)
	} catch (err) {
		next(err)
	}
}

const specialPartialCheckout = async (req, res, next) => {
	try {
		let {
			isCoinbase,
			isCreditCard,
			isMCTToken,
			isStripe,
			transaction_id,
			course_id,
			first_name,
			last_name,
			phone_number,
			address_line_1,
			address_line_2,
			state,
			country,
			zip_code,
			isShippingSame,
			isSave,
			source_url,
			cancel_url,
			referalUser,
			partialTime,
			purchsedId,
			isFullPay,
			purchase_amount_usd,
			sales_agent,
		} = req.body
		logger.checkOutData(`Partial checkout api ${JSON.stringify(req.body)}`)
		let address_id = req.body.address_id
		const userObj = await userService.userDetails(req.user.id)
		const userId = req.user.id
		const courseDetails = await courseService.courseDetails(course_id, 'id')
		if (!courseDetails.is_partial_payment_available) {
			return response.helper(
				res,
				false,
				'PARTIAL_PAYMENT_NOT_AVAILABLE',
				{},
				200
			)
		}
		const calculatedMctPrice = await commonService.calculateTokenAvg()
		const mctP = await commonHelper.avgPriceOfMCT(calculatedMctPrice)
		const mctPriceAtPurchase = mctP.price

		if (isMCTToken && transaction_id && transaction_id != '') {
			const trnasactionData = await web3Helper.getTransactionHashData(
				transaction_id
			)
			if (trnasactionData) {
				const { to, status } = trnasactionData
				if (!status) {
					return response.helper(
						res,
						false,
						'TRANSACTION_VALIDATION_FAILED',
						{},
						200
					)
				}
				if (to != config.OWNER_WALLET_ADDRESS) {
					return response.helper(
						res,
						false,
						'TRANSACTION_VALIDATION_FAILED',
						{},
						200
					)
				}
			} else {
				return response.helper(
					res,
					false,
					'TRANSACTION_VALIDATION_FAILED',
					{},
					200
				)
			}
		}

		if (isSave) {
			const addressData = await userService.saveAddress({
				first_name,
				last_name,
				phone_number,
				address_line_1,
				address_line_2,
				state,
				country,
				zip_code,
				user_id: req.user.id,
			})
			address_id = addressData.id
		}

		const itemList = []
		let stripeIdList = []
		const totalAmount = {
			currency: 'USD',
			total: 0,
		}
		const courseHistoryList = []
		const courseId = course_id
		const isCourseWithSameName = await courseService.courseDetails(
			courseId,
			'id'
		)
		const isCourseAlreadyPurchased = await courseService.userCoursesDetails(
			courseId,
			userId
		)
		if (isCourseAlreadyPurchased) {
			if (isCourseAlreadyPurchased.remian_payments) {
				if (
					purchsedId != isCourseAlreadyPurchased.id &&
					isCourseAlreadyPurchased.is_partial_payment
				) {
					return response.helper(
						res,
						false,
						'INCORRECT_PAYMENT_ID',
						{},
						200
					)
				}
			} else {
				return response.helper(
					res,
					false,
					'COURSE_ALREADY_PURCHASED',
					{},
					200
				)
			}
		}
		const ppOBJ = JSON.parse(courseDetails.partialpay_stripe_price_obj)
		console.log('ppOBJ--->', ppOBJ)
		let amount = 0
		let strPaymentDetails = ''
		if (purchsedId) {
			amount = isCourseAlreadyPurchased.each_payment_amount
			stripeIdList.push({
				price: isCourseAlreadyPurchased.next_payment_stripe_id,
				quantity: 1,
			})
		} else {
			if (
				partialTime === 1 ||
				partialTime === 2 ||
				partialTime === 4 ||
				partialTime === 6 ||
				partialTime === 10 ||
				partialTime === 12 ||
				partialTime === 13
			) {
				amount = ppOBJ[partialTime].original_price
				strPaymentDetails = `${ppOBJ[partialTime].emis} X $${ppOBJ[partialTime].original_price}`
			} else {
				amount = ppOBJ[partialTime].emi[0].original_price
				strPaymentDetails = `$${
					ppOBJ[partialTime].emi[0].original_price
				} + (${ppOBJ[partialTime].emis - 1} X $${
					ppOBJ[partialTime].emi[1].original_price
				})`
				console.log('amountset2--->', amount)
			}
			if (
				partialTime === 1 ||
				partialTime === 2 ||
				partialTime === 4 ||
				partialTime === 6 ||
				partialTime === 10 ||
				partialTime === 12 ||
				partialTime === 13
			) {
				stripeIdList.push({
					price: ppOBJ[partialTime].stripeid,
					quantity: 1,
				})
			} else {
				stripeIdList.push({
					price: ppOBJ[partialTime].emi[0].stripeid,
					quantity: 1,
				})
			}
		}
		// if (courseDetails.partialpay_stripe_price_obj) {
		// 	const stripeProduct = courseDetails.partialpay_stripe_price_obj
		// 		? JSON.parse(courseDetails.partialpay_stripe_price_obj)
		// 		: {}
		// 	const productPrice = partialTime
		// 		? stripeProduct[partialTime]
		// 		: stripeProduct[isCourseAlreadyPurchased.payment_devied_in]
		// 	if (productPrice) {
		// 		stripeIdList.push({
		// 			price: productPrice,
		// 			quantity: 1,
		// 		})
		// 	}
		// }
		console.log('amount1--->', amount)
		const itemData = {
			name: isCourseWithSameName.name,
			sku: isCourseWithSameName.slug,
			price: amount,
			currency: isMCTToken ? 'MCT' : 'USD',
			quantity: 1,
		}
		if (isFullPay) {
			itemData.price = amount * isCourseAlreadyPurchased.remian_payments
			amount = itemData.price
		}
		console.log('amount2--->', amount)
		totalAmount.total += amount
		itemList.push(itemData)
		console.log('amount3--->', amount)
		const courseUserTransactionData = {
			course_id: courseId,
			user_id: req.user.id,
			referal_user_id: referalUser,
			is_partial_payment: 1,
			payment_devied_in: ppOBJ[partialTime].emis,
			remian_payments: ppOBJ[partialTime].emis,
			each_payment_amount:
				partialTime === 1
					? amount
					: partialTime === 2
					? amount
					: partialTime === 4
					? amount
					: partialTime === 6
					? amount
					: partialTime === 10
					? amount
					: partialTime === 12
					? amount
					: partialTime === 13
					? amount
					: ppOBJ[partialTime].emi[1].original_price,
			user_ip: requestIp.getClientIp(req),
			next_payment_stripe_id:
				partialTime === 1
					? ppOBJ[partialTime].stripeid
					: partialTime === 2
					? ppOBJ[partialTime].stripeid
					: partialTime === 4
					? ppOBJ[partialTime].stripeid
					: partialTime === 6
					? ppOBJ[partialTime].stripeid
					: partialTime === 10
					? ppOBJ[partialTime].stripeid
					: partialTime === 12
					? ppOBJ[partialTime].stripeid
					: partialTime === 13
					? ppOBJ[partialTime].stripeid
					: ppOBJ[partialTime].emi[1].stripeid,
			payment_details: strPaymentDetails,
			purchase_amount_usd,
			sales_agent,
		}
		console.log(
			'courseUserTransactionData-------->',
			courseUserTransactionData
		)
		if (isMCTToken) {
			courseUserTransactionData.transaction_id = transaction_id
		} else {
			console.log('isCourseAlreadyPurchased', isCourseAlreadyPurchased)
			if (!isCourseAlreadyPurchased) {
				const userCourse =
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
				courseHistoryList.push(userCourse)
			} else {
				courseHistoryList.push(isCourseAlreadyPurchased)
			}
		}

		let paypalData
		const responseData = {}

		if (isCreditCard) {
		} else if (isCoinbase) {
			const paymentData = {
				item_list: {
					items: itemList,
				},
				amount: totalAmount,
				description: 'Checkout With Coinbase',
			}
			coinbaseData = await coinbaseCommerceHelper.createCharge(
				paymentData
			)
			for (let i = 0; i < courseHistoryList.length; i++) {
				await courseService.userCourseUpdate(
					courseHistoryList[i].dataValues.id,
					{
						address_id: address_id,
					}
				)
				await paymentService.savePaymentInstallment(
					userId,
					courseId,
					coinbaseData.code,
					amount,
					mctPriceAtPurchase,
					'coinbase',
					'pending',
					isFullPay
				)
			}
			responseData.redirectUrl = coinbaseData.hosted_url
		} else if (isMCTToken) {
			/**
			 * Mct Payment Start
			 */
			const userId = req.user.id

			const isTransactionHashExist =
				await courseService.isTransactionExist(transaction_id)
			let finalAmount = 0
			if (!isTransactionHashExist) {
				let purchaseData = {}
				if (purchsedId) {
					purchaseData = isCourseAlreadyPurchased
					if (purchaseData.remian_payments == 1) {
						await paymentService.savePaymentInstallment(
							userId,
							courseId,
							transaction_id,
							amount,
							mctPriceAtPurchase,
							'mct',
							'success',
							isFullPay
						)
						const savePaymentInstallmentList =
							await paymentService.paymentInstallments(
								courseId,
								userId
							)
						let totalMct = mctPriceAtPurchase
						savePaymentInstallmentList.forEach((eachPayment) => {
							totalMct += eachPayment.mct_amount_on_purchase
						})
						const finalMCTPrice =
							totalMct / purchaseData.payment_devied_in
						const purchaseAmount =
							(amount * purchaseData.payment_devied_in) /
							finalMCTPrice
						const updateCourseHistoryData = {
							mct_price_at_purchase: finalMCTPrice,
							purchased_amount: purchaseAmount,
							reward_amount:
								purchaseAmount + purchaseAmount * 0.2,
						}
						const userCourseHistory =
							await courseService.userCourseData(courseId, userId)
						await courseService.updateUserCourseData(
							userCourseHistory.id,
							updateCourseHistoryData
						)
						await courseService.userCourseUpdate(purchaseData.id, {
							remian_payments: 0,
							next_payment_date: null,
						})
						await courseService.addUserTransaction({
							user_id: userId,
							transaction_id,
							amount: amount / mctPriceAtPurchase,
							payment_with: 'mct',
						})
					} else if (purchaseData.remian_payments > 1) {
						if (isFullPay) {
							amount = amount * purchaseData.remian_payments
							const savePaymentInstallmentList =
								await paymentService.paymentInstallments(
									courseId,
									userId
								)
							let totalMct = mctPriceAtPurchase
							savePaymentInstallmentList.forEach(
								(eachPayment) => {
									totalMct +=
										eachPayment.mct_amount_on_purchase
								}
							)
							const finalMCTPrice =
								totalMct /
								(purchaseData.payment_devied_in -
									purchaseData.remian_payments +
									1)
							const purchaseAmount = amount / finalMCTPrice
							const updateCourseHistoryData = {
								mct_price_at_purchase: finalMCTPrice,
								purchased_amount: purchaseAmount,
								reward_amount:
									purchaseAmount + purchaseAmount * 0.2,
							}
							const userCourseHistory =
								await courseService.userCourseData(
									courseId,
									userId
								)
							await courseService.updateUserCourseData(
								userCourseHistory.id,
								updateCourseHistoryData
							)
						}
						await paymentService.savePaymentInstallment(
							userId,
							courseId,
							transaction_id,
							amount,
							mctPriceAtPurchase,
							'mct',
							'success',
							isFullPay
						)
						await courseService.userCourseUpdate(purchaseData.id, {
							remian_payments: isFullPay
								? 0
								: purchaseData.remian_payments - 1,
							next_payment_date: isFullPay
								? null
								: moment(purchaseData.next_payment_date).add(
										30,
										'days'
								  ),
						})
						await courseService.addUserTransaction({
							user_id: userId,
							transaction_id,
							amount: amount / mctPriceAtPurchase,
							payment_with: 'mct',
						})
					}
				} else {
					const courseId = course_id
					const courseUserTransactionData = {
						course_id: courseId,
						user_id: userId,
						// transaction_id,
						status: 1,
						is_partial_payment: 1,
						payment_devied_in: partialTime,
						remian_payments: partialTime - 1,
						next_payment_date: moment().add(30, 'days'),
						each_payment_amount: amount,
						user_ip: requestIp.getClientIp(req),
						purchase_amount_usd,
						sales_agent,
					}
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
					const prepareCourseHistory = {
						course_id: courseId,
						user_id: userId,
						started_at: null,
						// purchased_amount: Number(amount / mctPriceAtPurchase).toFixed(2),
						total_reward_earned: 0,
						// mct_price_at_purchase: mctPriceAtPurchase,
						transaction_id,
					}
					await activeCampagineHelper.addTagsToContact(
						userObj.dataValues.active_campagin_id,
						isCourseWithSameName.active_campagine_tag
					)
					await courseService.addCourseToUserData(
						prepareCourseHistory
					)
					//await commonHelper.purchaseDineroDesbloqueadoMail(userId);
					await courseService.removeToCart(courseId, userId)
					finalAmount += amount / mctPriceAtPurchase
					await courseService.addUserTransaction({
						user_id: userId,
						transaction_id,
						amount: finalAmount,
						payment_with: 'mct',
					})
					await paymentService.savePaymentInstallment(
						userId,
						courseId,
						transaction_id,
						amount,
						mctPriceAtPurchase,
						'mct',
						'success',
						isFullPay
					)
					if (userObj.dataValues.active_campagin_id) {
						await activeCampagineHelper.addContactToList(
							userObj.dataValues.active_campagin_id,
							config.PACKAGE_LIST
						)
					}
				}
			}

			/**
			 * Mct payment end
			 */
		} else if (isStripe) {
			const stripeIdData = stripeIdList[0]
			let stripeDataIds = []
			if (isFullPay) {
				for (
					let i = 0;
					i < isCourseAlreadyPurchased.remian_payments;
					i++
				) {
					stripeDataIds.push(stripeIdData)
				}
				console.log('stripeDataIds', stripeDataIds)
				stripeIdList = stripeDataIds
			}
			const paymentData = {
				successUrl: source_url,
				cancelUrl: cancel_url,
				listItems: isFullPay ? stripeDataIds : stripeIdList,
				mode: 'payment',
			}
			const stripeCheckoutData = await stripeHelper.createCheckout(
				paymentData
			)
			for (let i = 0; i < courseHistoryList.length; i++) {
				await courseService.userCourseUpdate(
					courseHistoryList[i].dataValues.id,
					{
						stripe_id: stripeCheckoutData.payment_intent,
						address_id: address_id,
					}
				)
				await paymentService.savePaymentInstallment(
					userId,
					courseId,
					stripeCheckoutData.payment_intent,
					amount,
					mctPriceAtPurchase,
					'stripe',
					'pending',
					isFullPay
				)
			}
			responseData.redirectUrl = stripeCheckoutData.url
		}

		return response.helper(res, true, 'CHECKOUT_SUCCESS', responseData, 200)
	} catch (err) {
		next(err)
	}
}

const specialPartialCheckoutv1 = async (req, res, next) => {
	try {
		let {
			isCoinbase,
			isCreditCard,
			isMCTToken,
			isStripe,
			transaction_id,
			course_id,
			first_name,
			last_name,
			email,
			phone_number,
			address_line_1,
			address_line_2,
			state,
			country,
			zip_code,
			isShippingSame,
			isSave,
			source_url,
			cancel_url,
			referalUser,
			partialTime,
			purchsedId,
			isFullPay,
			sourse,
			purchase_amount_usd,
			sales_agent,
		} = req.body
		logger.checkOutData(`Partial checkout api ${JSON.stringify(req.body)}`)

		if (!email) {
			return response.helper(res, false, 'EMAIL_REQUIRED', {}, 200)
		}
		const userExist = await userService.isEmailExist(email)
		if (userExist) {
			const user = await userService.userLoginData(userExist.id)
			req.user = user
		} else {
			const userRoleData = await userService.userRoleData('USR')
			const decryptPassword = `Test@123` //commonHelper.rendomString();
			const hash = commonHelper.shaPassword(decryptPassword)
			const level = await userService.levelDetailsByCode('PRI')
			const userData = {
				name: `${first_name} ${last_name}`,
				email,
				password: hash,
				accept_private_policy: 1,
				phone_number,
				role_id: userRoleData.id,
				level_id: level.id,
				is_phone_verified: 0,
			}
			const user = await userService.saveUser(userData)
			await userService.addToInquiries({
				email,
				name: `${first_name} ${last_name}`,
				phone_number,
				sourse,
				user_id: user.id,
			})
			await mailHelper.sendEmail({
				type: 'account-create',
				data: {
					email,
					FRONT_DOMAIN: process.env.FRONT_DOMAIN,
					password: decryptPassword,
					username: `${first_name} ${last_name}`,
				},
			})
			const activeCampagineData = {
				contact: {
					email,
					firstName: `${first_name} ${last_name}`,
					phone: phone_number,
				},
			}

			let activeCampagineUserId
			try {
				const activeCampagineUserExist =
					await activeCampagineHelper.contectFetchByEmail(email)
				if (
					activeCampagineUserExist &&
					activeCampagineUserExist?.data?.contacts?.length
				) {
					const [activeCampagineUser] =
						activeCampagineUserExist.data.contacts
					activeCampagineUserId = activeCampagineUser.id
				} else {
					const {
						data: {
							contact: { id },
						},
					} = await activeCampagineHelper.createContact(
						activeCampagineData
					)
					activeCampagineUserId = id
				}

				await activeCampagineHelper.addContactToList(
					activeCampagineUserId
				)
			} catch (err) {
				logger.error('failling becaus of active campagine')
			}
			req.user = user
		}

		let address_id = req.body.address_id
		const userObj = await userService.userDetails(req.user.id)
		const userId = req.user.id
		const courseDetails = await courseService.courseDetails(course_id, 'id')
		if (!courseDetails.is_partial_payment_available) {
			return response.helper(
				res,
				false,
				'PARTIAL_PAYMENT_NOT_AVAILABLE',
				{},
				200
			)
		}
		const calculatedMctPrice = await commonService.calculateTokenAvg()
		const mctP = await commonHelper.avgPriceOfMCT(calculatedMctPrice)
		const mctPriceAtPurchase = mctP.price

		if (isMCTToken && transaction_id && transaction_id != '') {
			const trnasactionData = await web3Helper.getTransactionHashData(
				transaction_id
			)
			if (trnasactionData) {
				const { to, status } = trnasactionData
				if (!status) {
					return response.helper(
						res,
						false,
						'TRANSACTION_VALIDATION_FAILED',
						{},
						200
					)
				}
				if (to != config.OWNER_WALLET_ADDRESS) {
					return response.helper(
						res,
						false,
						'TRANSACTION_VALIDATION_FAILED',
						{},
						200
					)
				}
			} else {
				return response.helper(
					res,
					false,
					'TRANSACTION_VALIDATION_FAILED',
					{},
					200
				)
			}
		}

		if (isSave) {
			const addressData = await userService.saveAddress({
				first_name,
				last_name,
				phone_number,
				address_line_1,
				address_line_2,
				state,
				country,
				zip_code,
				user_id: req.user.id,
			})
			address_id = addressData.id
		}

		const itemList = []
		let stripeIdList = []
		const totalAmount = {
			currency: 'USD',
			total: 0,
		}
		const courseHistoryList = []
		const courseId = course_id
		const isCourseWithSameName = await courseService.courseDetails(
			courseId,
			'id'
		)
		const isCourseAlreadyPurchased = await courseService.userCoursesDetails(
			courseId,
			userId
		)
		if (isCourseAlreadyPurchased) {
			if (isCourseAlreadyPurchased.remian_payments) {
				if (
					purchsedId != isCourseAlreadyPurchased.id &&
					isCourseAlreadyPurchased.is_partial_payment
				) {
					return response.helper(
						res,
						false,
						'INCORRECT_PAYMENT_ID',
						{},
						200
					)
				}
			} else {
				return response.helper(
					res,
					false,
					'COURSE_ALREADY_PURCHASED',
					{},
					200
				)
			}
		}
		const ppOBJ = JSON.parse(courseDetails.partialpay_stripe_price_obj)
		console.log('ppOBJ--->', ppOBJ)
		let amount = 0
		let strPaymentDetails = ''
		if (
			partialTime === 1 ||
			partialTime === 2 ||
			partialTime === 4 ||
			partialTime === 6 ||
			partialTime === 10 ||
			partialTime === 11 ||
			partialTime === 12 ||
			partialTime === 13
		) {
			amount = ppOBJ[partialTime].original_price
			strPaymentDetails = `${ppOBJ[partialTime].emis} X $${ppOBJ[partialTime].original_price}`
		} else {
			amount = ppOBJ[partialTime].emi[0].original_price
			strPaymentDetails = `$${
				ppOBJ[partialTime].emi[0].original_price
			} + (${ppOBJ[partialTime].emis - 1} X $${
				ppOBJ[partialTime].emi[1].original_price
			})`
		}
		if (
			partialTime === 1 ||
			partialTime === 2 ||
			partialTime === 4 ||
			partialTime === 6 ||
			partialTime === 10 ||
			partialTime === 11 ||
			partialTime === 12 ||
			partialTime === 13
		) {
			stripeIdList.push({
				price: ppOBJ[partialTime].stripeid,
				quantity: 1,
			})
		} else {
			stripeIdList.push({
				price: ppOBJ[partialTime].emi[0].stripeid,
				quantity: 1,
			})
		}
		// if (courseDetails.partialpay_stripe_price_obj) {
		// 	const stripeProduct = courseDetails.partialpay_stripe_price_obj
		// 		? JSON.parse(courseDetails.partialpay_stripe_price_obj)
		// 		: {}
		// 	const productPrice = partialTime
		// 		? stripeProduct[partialTime]
		// 		: stripeProduct[isCourseAlreadyPurchased.payment_devied_in]
		// 	if (productPrice) {
		// 		stripeIdList.push({
		// 			price: productPrice,
		// 			quantity: 1,
		// 		})
		// 	}
		// }
		console.log('amount1--->', amount)
		const itemData = {
			name: isCourseWithSameName.name,
			sku: isCourseWithSameName.slug,
			price: amount,
			currency: isMCTToken ? 'MCT' : 'USD',
			quantity: 1,
		}
		if (isFullPay) {
			itemData.price = amount * isCourseAlreadyPurchased.remian_payments
			amount = itemData.price
		}
		console.log('amount2--->', amount)
		totalAmount.total += amount
		itemList.push(itemData)
		console.log('amount3--->', amount)
		const courseUserTransactionData = {
			course_id: courseId,
			user_id: req.user.id,
			referal_user_id: referalUser,
			is_partial_payment: 1,
			payment_devied_in: ppOBJ[partialTime].emis,
			remian_payments: ppOBJ[partialTime].emis,
			each_payment_amount:
				partialTime === 1
					? amount
					: partialTime === 2
					? amount
					: partialTime === 4
					? amount
					: partialTime === 6
					? amount
					: partialTime === 10
					? amount
					: partialTime === 11
					? amount
					: partialTime === 12
					? amount
					: partialTime === 13
					? amount
					: ppOBJ[partialTime].emi[1].original_price,
			user_ip: requestIp.getClientIp(req),
			next_payment_stripe_id:
				partialTime === 1
					? ppOBJ[partialTime].stripeid
					: partialTime === 2
					? ppOBJ[partialTime].stripeid
					: partialTime === 4
					? ppOBJ[partialTime].stripeid
					: partialTime === 6
					? ppOBJ[partialTime].stripeid
					: partialTime === 10
					? ppOBJ[partialTime].stripeid
					: partialTime === 11
					? ppOBJ[partialTime].stripeid
					: partialTime === 12
					? ppOBJ[partialTime].stripeid
					: partialTime === 13
					? ppOBJ[partialTime].stripeid
					: ppOBJ[partialTime].emi[1].stripeid,
			payment_details: strPaymentDetails,
			purchase_amount_usd,
			sales_agent,
		}
		console.log(
			'courseUserTransactionData-------->',
			courseUserTransactionData
		)
		if (isMCTToken) {
			courseUserTransactionData.transaction_id = transaction_id
		} else {
			console.log('isCourseAlreadyPurchased', isCourseAlreadyPurchased)
			if (!isCourseAlreadyPurchased) {
				const userCourse =
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
				courseHistoryList.push(userCourse)
			} else {
				courseHistoryList.push(isCourseAlreadyPurchased)
			}
		}

		let paypalData
		const responseData = {}

		if (isCreditCard) {
		} else if (isCoinbase) {
			const paymentData = {
				item_list: {
					items: itemList,
				},
				amount: totalAmount,
				description: 'Checkout With Coinbase',
			}
			coinbaseData = await coinbaseCommerceHelper.createCharge(
				paymentData
			)
			for (let i = 0; i < courseHistoryList.length; i++) {
				await courseService.userCourseUpdate(
					courseHistoryList[i].dataValues.id,
					{
						address_id: address_id,
					}
				)
				await paymentService.savePaymentInstallment(
					userId,
					courseId,
					coinbaseData.code,
					amount,
					mctPriceAtPurchase,
					'coinbase',
					'pending',
					isFullPay
				)
			}
			responseData.redirectUrl = coinbaseData.hosted_url
		} else if (isMCTToken) {
			/**
			 * Mct Payment Start
			 */
			const userId = req.user.id

			const isTransactionHashExist =
				await courseService.isTransactionExist(transaction_id)
			let finalAmount = 0
			if (!isTransactionHashExist) {
				let purchaseData = {}
				if (purchsedId) {
					purchaseData = isCourseAlreadyPurchased
					if (purchaseData.remian_payments == 1) {
						await paymentService.savePaymentInstallment(
							userId,
							courseId,
							transaction_id,
							amount,
							mctPriceAtPurchase,
							'mct',
							'success',
							isFullPay
						)
						const savePaymentInstallmentList =
							await paymentService.paymentInstallments(
								courseId,
								userId
							)
						let totalMct = mctPriceAtPurchase
						savePaymentInstallmentList.forEach((eachPayment) => {
							totalMct += eachPayment.mct_amount_on_purchase
						})
						const finalMCTPrice =
							totalMct / purchaseData.payment_devied_in
						const purchaseAmount =
							(amount * purchaseData.payment_devied_in) /
							finalMCTPrice
						const updateCourseHistoryData = {
							mct_price_at_purchase: finalMCTPrice,
							purchased_amount: purchaseAmount,
							reward_amount:
								purchaseAmount + purchaseAmount * 0.2,
						}
						const userCourseHistory =
							await courseService.userCourseData(courseId, userId)
						await courseService.updateUserCourseData(
							userCourseHistory.id,
							updateCourseHistoryData
						)
						await courseService.userCourseUpdate(purchaseData.id, {
							remian_payments: 0,
							next_payment_date: null,
						})
						await courseService.addUserTransaction({
							user_id: userId,
							transaction_id,
							amount: amount / mctPriceAtPurchase,
							payment_with: 'mct',
						})
					} else if (purchaseData.remian_payments > 1) {
						if (isFullPay) {
							amount = amount * purchaseData.remian_payments
							const savePaymentInstallmentList =
								await paymentService.paymentInstallments(
									courseId,
									userId
								)
							let totalMct = mctPriceAtPurchase
							savePaymentInstallmentList.forEach(
								(eachPayment) => {
									totalMct +=
										eachPayment.mct_amount_on_purchase
								}
							)
							const finalMCTPrice =
								totalMct /
								(purchaseData.payment_devied_in -
									purchaseData.remian_payments +
									1)
							const purchaseAmount = amount / finalMCTPrice
							const updateCourseHistoryData = {
								mct_price_at_purchase: finalMCTPrice,
								purchased_amount: purchaseAmount,
								reward_amount:
									purchaseAmount + purchaseAmount * 0.2,
							}
							const userCourseHistory =
								await courseService.userCourseData(
									courseId,
									userId
								)
							await courseService.updateUserCourseData(
								userCourseHistory.id,
								updateCourseHistoryData
							)
						}
						await paymentService.savePaymentInstallment(
							userId,
							courseId,
							transaction_id,
							amount,
							mctPriceAtPurchase,
							'mct',
							'success',
							isFullPay
						)
						await courseService.userCourseUpdate(purchaseData.id, {
							remian_payments: isFullPay
								? 0
								: purchaseData.remian_payments - 1,
							next_payment_date: isFullPay
								? null
								: moment(purchaseData.next_payment_date).add(
										30,
										'days'
								  ),
						})
						await courseService.addUserTransaction({
							user_id: userId,
							transaction_id,
							amount: amount / mctPriceAtPurchase,
							payment_with: 'mct',
						})
					}
				} else {
					const courseId = course_id
					const courseUserTransactionData = {
						course_id: courseId,
						user_id: userId,
						// transaction_id,
						status: 1,
						is_partial_payment: 1,
						payment_devied_in: partialTime,
						remian_payments: partialTime - 1,
						next_payment_date: moment().add(30, 'days'),
						each_payment_amount: amount,
						user_ip: requestIp.getClientIp(req),
						purchase_amount_usd,
					}
					await courseService.addCourseToUserTransaction(
						courseUserTransactionData
					)
					const prepareCourseHistory = {
						course_id: courseId,
						user_id: userId,
						started_at: null,
						// purchased_amount: Number(amount / mctPriceAtPurchase).toFixed(2),
						total_reward_earned: 0,
						// mct_price_at_purchase: mctPriceAtPurchase,
						transaction_id,
					}
					await activeCampagineHelper.addTagsToContact(
						userObj.dataValues.active_campagin_id,
						isCourseWithSameName.active_campagine_tag
					)
					await courseService.addCourseToUserData(
						prepareCourseHistory
					)

					//await commonHelper.purchaseDineroDesbloqueadoMail(userId);
					await courseService.removeToCart(courseId, userId)
					finalAmount += amount / mctPriceAtPurchase
					await courseService.addUserTransaction({
						user_id: userId,
						transaction_id,
						amount: finalAmount,
						payment_with: 'mct',
					})
					await paymentService.savePaymentInstallment(
						userId,
						courseId,
						transaction_id,
						amount,
						mctPriceAtPurchase,
						'mct',
						'success',
						isFullPay
					)
					if (userObj.dataValues.active_campagin_id) {
						await activeCampagineHelper.addContactToList(
							userObj.dataValues.active_campagin_id,
							config.PACKAGE_LIST
						)
					}
				}
			}

			/**
			 * Mct payment end
			 */
		} else if (isStripe) {
			const stripeIdData = stripeIdList[0]
			let stripeDataIds = []
			if (isFullPay) {
				for (
					let i = 0;
					i < isCourseAlreadyPurchased.remian_payments;
					i++
				) {
					stripeDataIds.push(stripeIdData)
				}
				console.log('stripeDataIds', stripeDataIds)
				stripeIdList = stripeDataIds
			}
			const paymentData = {
				successUrl: source_url,
				cancelUrl: cancel_url,
				listItems: isFullPay ? stripeDataIds : stripeIdList,
				mode: 'payment',
			}
			const stripeCheckoutData = await stripeHelper.createCheckout(
				paymentData
			)
			for (let i = 0; i < courseHistoryList.length; i++) {
				await courseService.userCourseUpdate(
					courseHistoryList[i].dataValues.id,
					{
						stripe_id: stripeCheckoutData.payment_intent,
						address_id: address_id,
					}
				)
				await paymentService.savePaymentInstallment(
					userId,
					courseId,
					stripeCheckoutData.payment_intent,
					amount,
					mctPriceAtPurchase,
					'stripe',
					'pending',
					isFullPay
				)
			}
			responseData.redirectUrl = stripeCheckoutData.url
		}

		return response.helper(res, true, 'CHECKOUT_SUCCESS', responseData, 200)
	} catch (err) {
		next(err)
	}
}

const checkReferralCodeValid = async (req, res, next) => {
	try {
		const { course_id, referral_code } = req.body
		const referralCodeDetails = await userService.referralCodeData({
			course_id,
			code: referral_code,
		})
		const courseDetails = await courseService.courseDetails(course_id, 'id')
		if (!referralCodeDetails) {
			return response.helper(res, false, 'INVALID_REFERRAL', {}, 200)
		}
		const discount =
			(courseDetails.price * referralCodeDetails.discount_percentage) /
			100
		const payableAmount = courseDetails.price - discount
		return response.helper(
			res,
			true,
			'VALIDATE',
			{ referralCodeDetails, discount, payableAmount },
			200
		)
	} catch (err) {
		console.log(err)
		next(err)
	}
}

const checkMctDiscount = async (req, res, next) => {
	try {
		const userWalletd = await userService.walletList(req.user.id)
		let walletList = []
		userWalletd.forEach((each) => {
			walletList.push(each.wallet_address)
		})
		const holder = await userService.checkHolder(req.user.id, walletList)
		// if(holder){
		return response.helper(
			res,
			true,
			'VALIDATE',
			{ isMCTDiscountAvailable: true, discount_percentage: 25 },
			200
		)
		// } else {
		// 	return response.helper(res, true, 'VALIDATE', {isMCTDiscountAvailable: false, discount_percentage: 0}, 200)
		// }
	} catch (err) {
		next(err)
	}
}

const publicCoursePurchase = async (req, res, next) => {
	try {
		const { courseId } = req.body
		let userId = req.user.id
		const isPublicCourse = await courseService.publicCourseCheck(courseId)
		if (!isPublicCourse) {
			return response.helper(res, false, 'COURSE_NOT_FOUND', {}, 404)
		}
		const isCourseWithSameName = await courseService.courseDetails(
			courseId,
			'id'
		)
		if (!isCourseWithSameName) {
			return response.helper(res, false, 'COURSE_NOT_FOUND', {}, 404)
		}
		const isCourseAlreadyPurchased = await courseService.userCourseData(
			courseId,
			userId
		)
		if (isCourseAlreadyPurchased) {
			return response.helper(
				res,
				false,
				'COURSE_PURCHASED',
				isCourseAlreadyPurchased,
				200
			)
		}
		const tokenAv = await commonService.calculateTokenAvg()
		const responseData = commonHelper.avgPriceOfMCT(tokenAv)
		const mctAmount = responseData.price

		let purchaseAmount = Number(
			isCourseWithSameName.price / mctAmount
		).toFixed(2)
		const historyUser = {
			course_id: courseId,
			user_id: userId,
			stripe_id: 'Public_Course',
			status: 1,
		}
		await courseService.addCourseToUserTransaction(historyUser)
		const prepareCourseHistory = {
			course_id: courseId,
			user_id: userId,
			started_at: null,
			purchased_amount: purchaseAmount, // storing in mct
			reward_amount: 0,
			total_reward_earned: 0,
			mct_price_at_purchase: mctAmount,
			transaction_id: 'Public_Course',
		}
		await courseService.addCourseToUserData(prepareCourseHistory)
		const purchaseData = await courseService.userCourseData(
			courseId,
			userId
		)
		return response.helper(
			res,
			false,
			'COURSE_PURCHASED',
			purchaseData,
			200
		)
	} catch (err) {
		next(err)
	}
}

const walletDetails = async (req, res, next) => {
	try {
		const { id: userId } = req.user
		const data = await userService.walletData(userId)
		return response.helper(res, true, 'WALLET', data, 200)
	} catch (err) {
		next(err)
	}
}

const redeemMcToken = async (req, res, next) => {
	try {
		const { referralCode } = req.body
		const { id } = req.user
		const referralData = await userService.getMcReferralCodeData(
			referralCode
		)
		if (!referralData) {
			return response.helper(
				res,
				false,
				'REFERRAL_CODE_EXPIRED',
				referralData,
				200
			)
		}
		if (referralData?.user_id != null && referralData?.user_id != id) {
			return response.helper(
				res,
				false,
				'REFERRAL_CODE_EXPIRED',
				referralData,
				200
			)
		} else {
			const isUsed = await userService.checkIsAlreadyRedeemed(
				referralData.id,
				id
			)
			if (isUsed) {
				return response.helper(
					res,
					false,
					'REFERRAL_CODE_ALREADY_USED',
					referralData,
					200
				)
			} else {
				const userWalletData = await userService.walletData(id)
				await userService.deductMctFromWallet(id, {
					token_balance:
						userWalletData.token_balance + referralData.mct_amount,
				})
				await userService.addWalletHistory({
					user_id: id,
					amount: referralData.mct_amount,
					transaction_type: 'credit',
					referral_code: referralData.id,
				})
				return response.helper(
					res,
					true,
					'REFERRAL_CODE_REDEEMED',
					await userService.walletData(id),
					200
				)
			}
		}
	} catch (err) {
		next(err)
	}
}

const downloadCourseContent = async (req, res, next) => {
	try {
		const { courseId, lectureId } = req.body
		const userCourseData = await userService.userCoursePurchased(
			req.user.id,
			courseId
		)
		console.log(userCoursedata)
		if (!userCourseData) {
			return response.helper(
				res,
				false,
				'COURSE_DETAILS_NOT_FOUND',
				{},
				200
			)
		}
		// const documentData = await courseService.
	} catch (err) {
		next(err)
	}
}

const collectMcWalletReward = async (req, res, next) => {
	try {
		const { examId, insta_user_id } = req.body
		const userId = req.user.id
		const calculatedMctPrice = await commonService.calculateTokenAvg()
		const mctP = await commonHelper.avgPriceOfMCT(calculatedMctPrice)
		const mctPriceAtPurchase = mctP.price
		const userHistoryExamData = await courseService.userExamHistoryDetails(
			examId,
			userId
		)
		console.log(userHistoryExamData)
		if (userHistoryExamData) {
			if (userHistoryExamData.is_point_collected) {
				return response.helper(res, false, 'POINT_COLLECTED', {}, 200)
			}
			if (!userHistoryExamData.is_passed) {
				return response.helper(res, false, 'USER_NOT_PASSED', {}, 200)
			}

			if ((userHistoryExamData.reward_with = !'mc_wallet')) {
				return response.helper(res, false, 'REWARD_TYPE_WRONG', {}, 200)
			}
			const userWalletDetails = await userService.walletData(userId)
			const rewardAmount = Number(
				Number(
					userHistoryExamData.reword_points / mctPriceAtPurchase
				).toFixed()
			)
			const newBalance =
				Number(userWalletDetails.token_balance) + rewardAmount
			await userService.deductMctFromWallet(userId, {
				token_balance: newBalance,
			})
			await userService.addWalletHistory({
				user_id: userId,
				amount: rewardAmount,
				transaction_type: 'credit',
			})
			userHistoryExamData.is_point_collected = 1
			await examService.updateUserExamData(examId, userId, {
				is_point_collected: 1,
			})
			await userService.updateUser(userId, { insta_user_id })
			return response.helper(
				res,
				true,
				'POINT_COLLECTED',
				{ totalReward: rewardAmount },
				200
			)
		} else {
			return response.helper(res, false, 'EXAM_NOT_FOUND', {}, 200)
		}
	} catch (err) {
		next(err)
	}
}

const getquestionsAnswers = async (req, res, next) => {
	try {
		const oUserQuestions = await userService.getcourseQuestionAnswers(
			req.user.id,
			req.body.courseId,
			req.body.lecture_id
		)

		const obj = []
		for (const q of oUserQuestions) {
			const comments = await userService.getcourseQuestionComments(q.id)
			const totalComments = comments.length
			const likes = await userService.getcourseQuestionLikes(q.id)
			const totalLikes = likes.length
			const qobj = q.dataValues
			obj.push({ ...qobj, totalComments, totalLikes, comments, likes })
		}

		return response.helper(res, true, '_SUCCESS', { list: obj }, 200)
	} catch (err) {
		next(err)
	}
}
const createquestions = async (req, res, next) => {
	try {
		const { course_id, title, description, lecture_id, image_url } =
			req.body
		const oUserQuestions = await userService.addUserCourseQuestion({
			course_id,
			title,
			description,
			created_by: req.user.id,
			lecture_id,
			image_url,
		})

		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ list: oUserQuestions },
			200
		)
	} catch (err) {
		next(err)
	}
}

const updateQuestionAnswer = async (req, res, next) => {
	try {
		const { question_id, answer } = req.body
		const oUserQuestions = await userService.updateQuestionAnser(
			question_id,
			answer,
			req.user.id
		)

		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ list: oUserQuestions },
			200
		)
	} catch (err) {
		next(err)
	}
}

const deleteQuestionAnswer = async (req, res, next) => {
	try {
		const { question_id, answer } = req.body
		const oUserQuestions = await userService.deleteCourseQuestion(
			question_id
		)

		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ list: oUserQuestions },
			200
		)
	} catch (err) {
		next(err)
	}
}

const approveQuestionAnswer = async (req, res, next) => {
	try {
		const { question_id, is_approved } = req.body
		const oUserQuestions = await userService.approveQuestionAnswer(
			question_id,
			is_approved,
			req.user.id
		)

		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ list: oUserQuestions },
			200
		)
	} catch (err) {
		next(err)
	}
}

const addQuestionComments = async (req, res, next) => {
	try {
		const { question_id, comments, comments_by } = req.body
		const oUserQuestions = await userService.addCourseQuestionComments({
			question_id,
			comments,
			comments_by,
			created_by: req.user.id,
		})

		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ list: oUserQuestions },
			200
		)
	} catch (err) {
		next(err)
	}
}

const addQuestionLike = async (req, res, next) => {
	try {
		const { question_id, like_dislike } = req.body
		const oUserQuestions = await userService.courseQuestionLike({
			question_id,
			like_dislike,
			created_by: req.user.id,
		})

		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ list: oUserQuestions },
			200
		)
	} catch (err) {
		next(err)
	}
}

const getCourseAnnouncements = async (req, res, next) => {
	try {
		const oUserAnnouncements = await userService.getcourseAnnouncements(
			req.body.courseId
		)
		const obj = []
		for (const q of oUserAnnouncements) {
			const comments = await userService.getAnnouncementComments(q.id)
			const qobj = q.dataValues
			obj.push({ ...qobj, comments })
		}

		return response.helper(res, true, '_SUCCESS', { list: obj }, 200)
	} catch (err) {
		next(err)
	}
}

const createAnnouncement = async (req, res, next) => {
	try {
		const { course_id, title, description } = req.body
		const oannouncement = await userService.addAnnouncement({
			course_id,
			title,
			description,
			created_by: req.user.id,
		})

		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ list: oannouncement },
			200
		)
	} catch (err) {
		next(err)
	}
}

const updateAnnouncement = async (req, res, next) => {
	try {
		const { announcement_id, title, description } = req.body
		const oAnnouncement = await userService.updateAnnouncement(
			announcement_id,
			title,
			description
		)

		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ list: oAnnouncement },
			200
		)
	} catch (err) {
		next(err)
	}
}

const addAnnouncementComments = async (req, res, next) => {
	try {
		const { announcement_id, comments, comments_by } = req.body
		const ocomments = await userService.addCourseAnnouncementComments({
			announcement_id,
			comments,
			comments_by,
			created_by: req.user.id,
		})

		return response.helper(res, true, '_SUCCESS', { list: ocomments }, 200)
	} catch (err) {
		next(err)
	}
}

const getCourseNotes = async (req, res, next) => {
	try {
		const created_by = req.user.id
		const oUserNotes = await userService.getCourseNotes(
			req.body.courseId,
			created_by
		)

		return response.helper(res, true, '_SUCCESS', { list: oUserNotes }, 200)
	} catch (err) {
		next(err)
	}
}

const createCourseNotes = async (req, res, next) => {
	try {
		const { course_id, lecture_id, title, description, image_url } =
			req.body
		const oNotes = await userService.AddCourseNotes({
			course_id,
			lecture_id,
			title,
			description,
			created_by: req.user.id,
			image_url,
		})

		return response.helper(res, true, '_SUCCESS', { list: oNotes }, 200)
	} catch (err) {
		next(err)
	}
}

const getQAAdmin = async (req, res, next) => {
	try {
		const oUserQuestions = await userService.getQAForAdmin(
			req.body.courseId,
			req.body.lecture_id
		)
		const obj = []
		for (const q of oUserQuestions) {
			const comments = await userService.getcourseQuestionComments(q.id)
			const likes = await userService.getcourseQuestionLikes(q.id)
			const qobj = q.dataValues
			obj.push({ ...qobj, comments, likes })
		}

		return response.helper(res, true, '_SUCCESS', { list: obj }, 200)
	} catch (err) {
		next(err)
	}
}

const createUserController = async (req, res, next) => {
	try {
		const {
			email,
			adult,
			accept_private_policy,
			phone_number,
			name,
			sourse,
			is_phone_verified,
			course_id,
		} = req.body
		const checkIsExist = await userService.isEmailExist(email)
		if (checkIsExist) {
			await userService.addToInquiries({
				email,
				name,
				phone_number,
				sourse,
				user_id: checkIsExist.id,
			})
			return response.helper(res, false, 'EMAIL_ALREADY_EXIST', {}, 200)
		}
		const userRoleData = await userService.userRoleData('USR')
		const decryptPassword = `Test@123` //commonHelper.rendomString();
		const hash = commonHelper.shaPassword(decryptPassword)
		const level = await userService.levelDetailsByCode('PRI')
		const userData = {
			name,
			email,
			password: hash,
			adult,
			accept_private_policy,
			phone_number,
			role_id: userRoleData.id,
			level_id: level.id,
			is_phone_verified: is_phone_verified || 0,
		}
		const user = await userService.saveUser(userData)
		await userService.addToInquiries({
			email,
			name,
			phone_number,
			sourse,
			user_id: user.id,
		})

		await mailHelper.sendEmail({
			type: 'account-create',
			data: {
				email,
				FRONT_DOMAIN: process.env.FRONT_DOMAIN,
				password: decryptPassword,
				username: name,
			},
		})

		const activeCampagineData = {
			contact: {
				email,
				firstName: name,
				phone: phone_number,
			},
		}

		let activeCampagineUserId
		try {
			const activeCampagineUserExist =
				await activeCampagineHelper.contectFetchByEmail(email)
			if (
				activeCampagineUserExist &&
				activeCampagineUserExist?.data?.contacts?.length
			) {
				const [activeCampagineUser] =
					activeCampagineUserExist.data.contacts
				activeCampagineUserId = activeCampagineUser.id
			} else {
				const {
					data: {
						contact: { id },
					},
				} = await activeCampagineHelper.createContact(
					activeCampagineData
				)
				activeCampagineUserId = id
			}
			if (course_id && course_id != '') {
				await activeCampagineHelper.addContactToList(
					activeCampagineUserId,
					130
				)
			} else {
				await activeCampagineHelper.addContactToList(
					activeCampagineUserId
				)
			}
		} catch (err) {
			logger.error('failling becaus of active campagine')
		}
		return response.helper(res, true, 'USER_REGISTERED_SUCCESS', {}, 200)
	} catch (err) {
		next(err)
	}
}

const getExamUserResults = async (req, res, next) => {
	try {
		const user_id = req.user.id
		const { exam_id } = req.body
		const list = await db.sequelize.query(
			`SELECT 
					id,
					question,
					CASE
						WHEN user_answer = 1 THEN option1
						WHEN user_answer = 2 THEN option2
						WHEN user_answer = 3 THEN option3
						WHEN user_answer = 4 THEN option4
					END AS UserAnswer,
					CASE
						WHEN correct_answer = 1 THEN option1
						WHEN correct_answer = 2 THEN option2
						WHEN correct_answer = 3 THEN option3
						WHEN correct_answer = 4 THEN option4
					END AS CorrectAnswer,
					is_correct
				FROM
					user_que_answers
				WHERE
					exam_id = ${exam_id} AND user_id = ${user_id};
	`
		)
		const result = await db.sequelize.query(
			`select is_passed,percentage,start_time,completed_time from history_user_exams 
			where 
					exam_id = ${exam_id} AND user_id = ${user_id};
	`
		)
		return response.helper(
			res,
			true,
			'results',
			{ answers: list[0], result: result[0] },
			200
		)
	} catch (err) {
		next(err)
	}
}

const getUserInvoices = async (req, res, next) => {
	const user_id = req.user.id
	const list = await db.sequelize.query(
		`select u.name, c.name as course_name,i.amount, i.invoice_pdf_url,i.created_at from course_invoices i
		join courses c on c.id = i.course_id
		join users u on u.id = i.user_id
		where u.id = ${user_id}  order by i.created_at desc;`
	)
	return response.helper(res, true, 'PAYMENT_LIST', list[0], 200)
}

module.exports = {
	collectMcWalletReward,
	updateDiscodName,
	redeemMcToken,
	walletDetails,
	publicCoursePurchase,
	checkMctDiscount,
	checkReferralCodeValid,
	partialCheckout,
	completeCourseReuqest,
	mintUserNFT,
	downloadUserNFT,
	saveUserReport,
	startCourseRequest,
	validateUserTransaction,
	addActiveCampagineTalkToExpert,
	earlyChekout,
	isCourseAlreadyBought,
	linkEmailToWallet,
	privacyPolicyUpdate,
	invoiceList,
	removeWalletFromUser,
	listUserWallets,
	verifyWalletAndLink,
	makeUserWalletDefault,
	verifyPaypalOrder,
	claimUserReward,
	editUserProfile,
	userInfo,
	createUser,
	updateUser,
	userDetails,
	deleteUser,
	resetPassword,
	uploadProfilePic,
	courseToCart,
	removeToCart,
	userCartList,
	courseToWish,
	userWishList,
	removeToWish,
	userCourseInit,
	userLectureVideoAccess,
	updateUserLastWatchCourse,
	// purchaseCourseStripe,
	checkOutCart,
	requestForCourseExam,
	requestForExamStart,
	submitExamAns,
	listMyCourses,
	endLectureController,
	checkPaymentStatus,
	completeExam,
	userExamResult,
	usersAddressList,
	userRemoveAddress,
	notficationSettingUpdate,
	getquestionsAnswers,
	createquestions,
	updateQuestionAnswer,
	approveQuestionAnswer,
	addQuestionComments,
	addQuestionLike,

	getCourseAnnouncements,
	createAnnouncement,
	updateAnnouncement,
	addAnnouncementComments,

	getCourseNotes,
	createCourseNotes,
	getQAAdmin,
	specialPartialCheckout,
	specialPartialCheckoutv1,
	updateEmployeeType,
	updateUserMandate,
	updateUsertelgramSubmitted,
	resetFormModule,
	resetCompleteModule,
	createUserController,
	getExamUserResults,
	deleteQuestionAnswer,
	getUserInvoices,
}
