const response = require('../helpers/response.helper')
const coinService = require('../dbService/coin.services')
const courseService = require('../dbService/course.services')
const userService = require('../dbService/user.service')
const commonHelper = require('../helpers/common.helper')
const jwtHelper = require('../helpers/jwt')
const commonService = require('../dbService/common.service')
const otpGenerator = require('otp-generator')
const moment = require('moment')
const mailHelper = require('../helpers/email.helper')
const constants = require('../config/constants')
const { decrypt } = require('../helpers/jwt')
const web3Helper = require('../helpers/web3.helper')
const activeCampagineHelper = require('../helpers/activecampaign')
const logger = require('../config/logger')
const coinbaseHelper = require('../helpers/coinbase.helper');
const snsHelper = require('../helpers/sns.helper');

const loginController = async (req, res, next) => {
	try {
		const { email, password, phone_number, course_id } = req.body
		const user = await userService.isEmailExist(email)
		if (!user) {
			return response.helper(res, false, 'INVALID_CREDENTIALS', {}, 200)
		}
		const decryptPassword = commonHelper.decryptString(password)
		const hash = commonHelper.shaPassword(decryptPassword)
		if (hash != user.password) {
			return response.helper(res, false, 'INVALID_CREDENTIALS', {}, 200)
		}
		const loginUser = await userService.userLoginData(user.id)
		const userFavCrypto = []
		const token = await jwtHelper.generateToken({
			id: user.id,
			email,
			role_id: user.role_id,
		})
		const userRewardPoints = await userService.calculateUserRewardPoints(
			user.id
		)

		const userData = {
			id: user.id,
			email,
			name: user.name,
			date_birth: user.date_birth,
			gender: user.gender,
			phone_number,
			avatar: user.avatar || '',
			role: loginUser?.roles.name,
			level_id: loginUser?.levels?.id,
			level_crypto: loginUser?.levels?.name,
			newsletter_name: loginUser?.newsletters?.name,
			newsletter_code: loginUser?.newsletters?.code,
			fav_cryptos: userFavCrypto,
			access_token: token,
			un_collected_reward_points: userRewardPoints?.dataValues
				.un_collected_points
				? userRewardPoints?.dataValues.un_collected_points
				: 0,
			request_to_collect_points: userRewardPoints?.dataValues
				.request_to_collect
				? userRewardPoints?.dataValues.request_to_collect
				: 0,
		}

		await userService.updateUser(user.id, { token })
		if(course_id && course_id != '') {
			await activeCampagineHelper.addContactToList(loginUser?.activeCampagineUserId, 130)
		}

		return response.helper(res, true, 'LOGIN_SUCCESS', userData, 200)
	} catch (err) {
		next(err)
	}
}

const web3LoginController = async (req, res, next) => {
	try {
		const { walletAddress, signature, chainId, course_id } = req.body
		const isWalletCorrect = await web3Helper.validateUserToWallet(
			walletAddress,
			signature,
			chainId,
			req.headers.language
		)
		if (isWalletCorrect) {
			let user = await userService.userDetailsByWalletAddress(
				walletAddress
			)
			if (!user) {
				const userRoleData = await userService.userRoleData('USR')
				const newUser = await userService.saveUser({
					role_id: userRoleData.id,
				})
				const userWalletData = await userService.saveUserWalletAddress(
					newUser.id,
					walletAddress,
					false
				)
				user = newUser
				// return response.helper(res, false, 'USER_NOT_REGISTERED', {}, 201);
			}
			const loginUser = await userService.userLoginData(user.id)
			const userFavCrypto = []
			const token = await jwtHelper.generateToken({
				id: user.id,
				email: user.email,
				role_id: user.role_id,
			})
			const userData = {
				id: user.id,
				email: user.email || '',
				name: user.name || '',
				date_birth: user.date_birth || '',
				gender: user.gender || '',
				avatar: user.avatar || '',
				phone_number: user.phone_number || '',
				role: loginUser?.roles.name,
				level_id: loginUser?.levels?.id,
				level_crypto: loginUser?.levels?.name,
				newsletter_name: loginUser?.newsletters?.name,
				newsletter_code: loginUser?.newsletters?.code,
				fav_cryptos: userFavCrypto,
				access_token: token,
			}
			await userService.updateUser(user.id, { token })
			if(course_id && course_id != '') {
				await activeCampagineHelper.addContactToList(loginUser?.activeCampagineUserId, 130)
			}
	
			return response.helper(res, true, 'LOGIN_SUCCESS', userData, 200)
			// }
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
const socialLogin = async (req, res, next) => {
	try {
		return response.helper(res, true, 'LOGIN_SUCCESS', {}, 200)
	} catch (err) {
		next(err)
	}
}

const signupController = async (req, res, next) => {
	try {
		const {
			email,
			password,
			adult,
			accept_private_policy,
			phone_number,
			name,
			walletAddress,
			sourse,
			is_phone_verified,
			course_id,
		} = req.body
		const checkIsExist = await userService.isEmailExist(email);
		if (checkIsExist) {
			await userService.addToInquiries({email, name, phone_number, sourse, user_id: checkIsExist.id})
			return response.helper(res, false, 'EMAIL_ALREADY_EXIST', {}, 200)
		}
		const userRoleData = await userService.userRoleData('USR')
		const decryptPassword = commonHelper.decryptString(password)
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
		await userService.addToInquiries({email, name, phone_number, sourse, user_id: user.id})

		await mailHelper.sendEmail({
			type: 'welcome',
			data: { email, FRONT_DOMAIN: process.env.FRONT_DOMAIN },
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
			const [activeCampagineUser] = activeCampagineUserExist.data.contacts
			activeCampagineUserId = activeCampagineUser.id
		} else {
			const {
				data: {
					contact: { id },
				},
			} = await activeCampagineHelper.createContact(activeCampagineData)
			activeCampagineUserId = id
		}
		if(course_id && course_id != '') {
			await activeCampagineHelper.addContactToList(activeCampagineUserId, 130)
		} else {
			await activeCampagineHelper.addContactToList(activeCampagineUserId)
		}
		} catch (err) {
			logger.error('failling becaus of active campagine')
		}
		// await commonHelper.signupConfirmEmailDataHelper(user.id, email, name);
		if (walletAddress) {
			await userService.saveUserWalletAddress(user.id, walletAddress, 0)
		}
		const token = await jwtHelper.generateToken({
			id: user.id,
			email,
			role_id: userRoleData.id,
		})
		const loginUser = await userService.userLoginData(user.id)
		const newUserData = {
			id: user.id,
			email,
			name: user.name,
			date_birth: user.date_birth,
			gender: user.gender,
			phone_number,
			role: loginUser?.roles.name,
			level_id: loginUser?.levels?.id,
			level_crypto: loginUser?.levels?.name,
			newsletter_name: loginUser?.newsletters?.name,
			newsletter_code: loginUser?.newsletters?.code,
			fav_cryptos: [],
			access_token: token,
			active_campagin_id: activeCampagineUserId,
		}
		await userService.updateUser(user.id, {
			token,
			active_campagin_id: activeCampagineUserId,
		})
		return response.helper(
			res,
			true,
			'USER_REGISTERED_SUCCESS',
			newUserData,
			200
		)
	} catch (err) {
		next(err)
	}
}


const forgotpasswordController = async (req, res, next) => {
	try {
		const { email } = req.body
		const user = await userService.isEmailExist(email)
		if (!user) {
			return response.helper(res, false, 'USER_NOT_FOUND', {}, 200)
		}
		const expired_at = moment().add(5, 'm')
		const otp = await otpGenerator.generate(6, {
			specialChars: false,
			lowerCaseAlphabets: false,
			upperCaseAlphabets: false,
		})
		const data = await mailHelper.sendEmail({
			type: 'forgot-password',
			data: {
				email,
				code: otp,
				name: user.name,
				FRONT_DOMAIN: process.env.FRONT_DOMAIN,
			},
		})
		await userService.addToPasswordReset({ token: otp, email, expired_at })
		return response.helper(
			res,
			true,
			'OTP_SENT_TO_EMAIL',
			{ levels: data },
			200
		)
	} catch (err) {
		next(err)
	}
}
const changepasswordController = async (req, res, next) => {
	try {
		const { email, otp, password } = req.body
		const user = await userService.isEmailExist(email)
		if (!user) {
			return response.helper(res, false, 'USER_NOT_FOUND', {}, 200)
		}
		const otpMatch = await userService.matchOtp(email, otp)
		if (!otpMatch) {
			return response.helper(
				res,
				false,
				'OTP_NOT_MATCH_OR_EXPIRED',
				{},
				200
			)
		} else {
			await userService.deleteUserOtp(email, otp)
		}
		const hash = commonHelper.shaPassword(password)
		await userService.updateUser(user.id, { password: hash })
		return response.helper(res, true, 'PASSWORD_CHANGED', {}, 200)
	} catch (err) {
		next(err)
	}
}

const coinListBySearch = async (req, res, next) => {
	try {
		const { search } = req.query
		const data = await coinService.apiCryptoCurrenciesData(search)
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ cryptocurrencies: data },
			200
		)
	} catch (err) {
		next(err)
	}
}

const listCategory = async (req, res, next) => {
	try {
		const {language} = req.headers;
		if (language) {
			const data = await courseService.categoryListByLang(language) 
			return response.helper(res, true, '_SUCCESS', { category: data }, 200)
		}
		const data = await courseService.categoryList()
		return response.helper(res, true, '_SUCCESS', { category: data }, 200)
	} catch (err) {
		next(err)
	}
}

const listCourse = async (req, res, next) => {
	try {
		let { page, per_page, category, search } = req.query
		if ((page && per_page) || per_page) {
			if (!page) {
				page = 1
			}
		} else {
			const count = await courseService.totalCourse()
			per_page = count
			page = 1
		}
		page = Number(page)
		per_page = Number(per_page)
		const status = await commonService.statusDetails('PUB')
		const data = await courseService.courseListData(
			status.id,
			search,
			category,
			page,
			per_page,
			req.headers.language
		)
		let whiteListedCourseList = []
		try {
			const {authorization} = req.headers;
			let decoded;
			if (authorization) {
				decoded = decrypt(authorization);
				const {data} = decoded;
				const user = await userService.userLoginData(data.id);
				const isUserWhiteListed = await courseService.isEmailWhiteListed(user.email);
				if(isUserWhiteListed) {
					whiteListedCourseList = await courseService.whiteListedCourseList(
						user.email,
						status.id,
						search,
						category,
						page,
						per_page
					);	
				}
			}
		} catch (err) {
			console.log(err);
		}
		const finalList = [...data, ...whiteListedCourseList];
		const packPrice = await commonHelper.packagePrice()
		const totalCoursePrice = await commonHelper.totalCoursePrice()
		const discountedPrice =
			(totalCoursePrice.dataValues.packagePrice -
				packPrice.dataValues.price) /
			7
		finalList.forEach((eachCourse) => {
			eachCourse.dataValues.discount = discountedPrice
			eachCourse.dataValues = eachCourse.dataValues
		})
		return response.helper(res, true, '_SUCCESS', { category: finalList }, 200)
	} catch (err) {
		next(err)
	}
}

const listPublicTestimonials = async (req, res, next) => {
	try {
		const { language } = req.query
		const testimonials = await userService.publicTestimonials()
		return response.helper(res, true, '_SUCCESS', { testimonials }, 200)
	} catch (err) {
		next(err)
	}
}

const listNoticeCategory = async (req, res, next) => {
	try {
		const categories = await commonService.noticeCategory()
		return response.helper(res, true, '_SUCCESS', { categories }, 200)
	} catch (err) {
		next(err)
	}
}

const listArticleCategory = async (req, res, next) => {
	try {
		const categories = await commonService.articleCategory()
		return response.helper(res, true, '_SUCCESS', { categories }, 200)
	} catch (err) {
		next(err)
	}
}

const courseDetails = async (req, res, next) => {
	try {
		const { courseId } = req.params
		let user
		try {
			const {authorization} = req.headers;
			let decoded;
			if (authorization) {
				decoded = decrypt(authorization);
				const {data} = decoded;
				let userDetails = await userService.userLoginData(data.id);
				console.log('user', user);
				user = userDetails.roles.code == 'ADM' ? 1 : 0
			}
		} catch (err) {
			console.log(err);
		}
		const data = await courseService.getCoursePublicDetails(courseId, user, req.headers.language)
		console.log('data', data);
		const [examList] = await courseService.examList(courseId);
		if (!data) {
			return response.helper(res, false, 'COURSE_NOT_FOUND', {}, 200)
		}
		if(data?.is_public) {
			data.dataValues.reward = examList?.reward || 0;
		} 		
		return response.helper(res, true, '_SUCCESS', { courseData: data,  }, 200)
	} catch (err) {
		next(err)
	}
}

const searchCourse = async (req, res, next) => {
	try {
		const { search } = req.query
		const status = await commonService.statusDetails('PUB')
		const list = []
		const dataCourse = await courseService.searchCourseList(
			status.id,
			search
		)
		// const dataCategory = await courseService.searchNoticeCategoryList(
		// 	search
		// )
		list.push(...dataCourse)
		// list.push(...dataCategory)
		return response.helper(res, true, '_SUCCESS', { courses: list }, 200)
	} catch (err) {
		next(err)
	}
}

const checkAuthToken = async (req, res, next) => {
	const { authorization } = req.headers
	let decoded
	if (!authorization) {
		return response.helper(
			res,
			false,
			'TOKEN_REQUIRED',
			{},
			constants.responseStatus.BAD_REQUEST
		)
	}
	try {
		decoded = decrypt(authorization)
		return response.helper(
			res,
			true,
			'TOKEN_VALID',
			{},
			constants.responseStatus.SUCCESS
		)
	} catch (e) {
		return response.helper(
			res,
			false,
			'AUTH_TOKEN_EXPIRED',
			{},
			constants.responseStatus.BAD_REQUEST
		)
	}
}

const getTokenValue = async (req, res, next) => {
	try {
		const data = await commonService.calculateTokenAvg()
		const responseData = commonHelper.avgPriceOfMCT(data)
		return response.helper(
			res,
			true,
			'_SUCCESS',
			{ data: responseData },
			200
		)
	} catch (err) {
		next(err)
	}
}

const listPackages = async (req, res, next) => {
	try {
		const data = await courseService.Packages()
		return response.helper(res, true, '_SUCCESS', { packages: data }, 200)
	} catch (err) {
		next(err)
	}
}
const packageDetails = async (req, res, next) => {
	try {
 		const { packageId } = req.params
		const packageData = await courseService.packageDetails(packageId)	
    if (packageData) {
			const courseArr = packageData.course_ids.split(',')
      const courses = await courseService.packageCourses(courseArr)
			const packPrice = await commonHelper.packagePrice()
			const totalCoursePrice = await commonHelper.totalCoursePrice()
      const discountedPrice =
				(totalCoursePrice.dataValues.packagePrice -
					packPrice.dataValues.price) /
				7
			courses.forEach((eachCourse) => {
				eachCourse.dataValues.discount = discountedPrice
				eachCourse.dataValues = eachCourse.dataValues
			})
      let discountDetails = {}
		


      const {authorization} = req.headers;
      let decoded;

      if (authorization) {
        try {
          decoded = jwtHelper.decrypt(authorization);
          const {data} = decoded;
          const user = await userService.userLoginData(data.id);
          if (user) {
            const userDetails = await userService.getAvailableCoupon(
              user.id
            )
            const [discount] = userDetails
            if (discount) {
              discountDetails = await courseService.discountDetails(
                discount.discount_id
              )
            }
          }
        } catch (e) {
          console.log('er',e);
        }
      }
    
			return response.helper(
				res,
				true,
				'_SUCCESS',
				{
					data: {
						packageData,
						courses,
            discountDetails 
					},
				},
				200
			)
		} else {
      console.log('in else');
			return response.helper(res, false, '_SUCCESS', {}, 400)
		}
	} catch (err) {
    console.log('in err');
		next(err)
	}
}

const validateCoinbase = async (req, res, next) => {
	try {
		const {coinbaseId} = req.body;
		const data = await coinbaseHelper.getChargeData(coinbaseId);
		return response.helper(res, true, '', data, 200);
	} catch (err) {
		next(err);
	}
}

const sendOtp = async (req, res, next) => {
	try {
		const {mobile_number} = req.body;
		const otp = await  commonHelper.otp();
		const expiryTime = moment().add(5, 'minutes');
		await snsHelper.sendSMS('send-otp', {otp, mobileNo: mobile_number});
		await userService.saveOtp(otp, expiryTime, mobile_number)
		return response.helper(res, true, 'OTP_SEND_SUCCESSFULLY', {}, 200);
	} catch (err) {
		next(err);
	}
}

const verifyOtp = async (req, res, next) => {
	try {
		const {mobile_number, otp} = req.body;
		const otpData = await userService.verifyOtp(mobile_number, otp);
		if(otpData && otpData.phone_number == mobile_number && otp == otpData.otp) {
			const nowDate = moment();
			if(nowDate <= otpData.expiry_time) {
				await userService.updateOtpVerified(mobile_number);
				const {authorization} = req.headers;
				let decoded;
				if (!authorization) {
					return response.helper(res, true, 'OTP_VERIFIED', {}, 200);	  
				} else {
					try {
						decoded = decrypt(authorization);
						const {data} = decoded;
						await userService.updateUser(data.id, {is_phone_verified: 1});
						await userService.updateOtpVerified(mobile_number);
						return response.helper(res, true, 'OTP_VERIFIED', {}, 200);
					} catch (e) {
						return response.helper(res, true, 'OTP_VERIFIED', {}, 200);
					} 	  
				}
			} else {
				return response.helper(res, false, 'OTP_EXPIRED', {}, 200);
			}
		} else {
			return response.helper(res, false, 'OTP_EXPIRED', {}, 200);
		}
	} catch (err) {
		next(err);
	}
}

const saveUserMarketingDetails = async (req, res, next) => {
	try {
		const {user_id, course_id, name, email, phone_number} = req.body;
		const marketingDetails = await commonService.saveMarketingDetails({
			user_id, 
			course_id,
			name,
			email,
			phone_number,
		})
		return response.helper(res, true, 'MARKETING_DETAILS_SAVED', marketingDetails, 200);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	saveUserMarketingDetails,
	verifyOtp,
	sendOtp,
	validateCoinbase,
	listPackages,
	packageDetails,
	web3LoginController,
	loginController,
	socialLogin,
	signupController,
	coinListBySearch,
	listCategory,
	listCourse,
	listPublicTestimonials,
	listNoticeCategory,
	listArticleCategory,
	courseDetails,
	searchCourse,
	forgotpasswordController,
	changepasswordController,
	checkAuthToken,
	getTokenValue
}
