const response = require('../helpers/response.helper')
const web3Helper = require('../helpers/web3.helper')
const logger = require('../config/logger')
const courseService = require('../dbService/course.services')
const paymentService = require('../dbService/payment.service')
const commonHelper = require('../helpers/common.helper')
const commonService = require('../dbService/common.service')
const userService = require('../dbService/user.service')
const coinbaseCommerceHelper = require('../helpers/coinbase.helper')
const stripeHelper = require('../helpers/stripe.helper')
const activeCampagineHelper = require('../helpers/activecampaign')
const requestIp = require('request-ip')
const mailHelper = require('../helpers/email.helper')

exports.nftCheckout = async (req, res, next) => {
	try {
		const {
			isStripe,
			isCoinbase,
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
			course_id,
		} = req.body
		logger.checkOutData(`NFT purchase api ${JSON.stringify(req.body)}`)

		let address_id = req.body.address_id
		const userObj = await userService.userDetails(req.user.id)
		const userWallet = await userService.isUserHaveDefaultWallet(
			req.user.id
		)
		if (!userWallet) {
			return response.helper(res, false, 'CONNECT_TO_WALLET', {}, 200)
		}
		// calculate mct price
		const calculatedMctPrice = await commonService.calculateTokenAvg()
		const mctP = await commonHelper.avgPriceOfMCT(calculatedMctPrice)
		const mctPriceAtPurchase = mctP.price

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

		const courseDetails = await courseService.courseDetails(course_id, 'id')
		const userCourseData = await courseService.userCourseData(
			course_id,
			req.user.id
		)
		if (!courseDetails.is_public) {
			return response.helper(
				res,
				false,
				'COURSE_DETAILS_NOT_FOUND',
				{},
				200
			)
		}
		if (userCourseData?.is_nft_minted) {
			return response.helper(res, false, 'NFT_ALREADY_MINTED', {}, 200)
		}

		// total amount in usd
		const totalAmount = {
			currency: 'USD',
			total: courseDetails.nft_purchase_price,
		}

		const responseData = {}
		const itemList = [
			{
				name: courseDetails.name,
				sku: 'NFT',
				price: courseDetails.nft_purchase_price,
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
			console.log(courseDetails)
			await paymentService.saveNftPurchaseData({
				course_id,
				transaction_id: coinbaseData.code,
				purchase_with: 'coinbase',
				user_id: req.user.id,
				status: 0,
				mct_price_at_purchase: mctPriceAtPurchase,
				address_id: address_id,
				amount: courseDetails.nft_purchase_price,
			})
			responseData.redirectUrl = coinbaseData.hosted_url
		} else if (isMCTToken) {
			/**
			 * Mct Payment Start
			 */
			const userId = req.user.id
			const isTransactionHashExist =
				await courseService.isTransactionExist(transaction_id)

			if (!isTransactionHashExist) {
				await paymentService.saveNftPurchaseData({
					course_id,
					transaction_id: transaction_id,
					purchase_with: 'mct',
					user_id: req.user.id,
					status: 1,
					mct_price_at_purchase: mctPriceAtPurchase,
					address_id: address_id,
					amount:
						courseDetails.nft_purchase_price / mctPriceAtPurchase,
				})
				await courseService.addUserTransaction({
					user_id: userId,
					transaction_id,
					amount:
						courseDetails.nft_purchase_price / mctPriceAtPurchase,
					payment_with: 'mct',
				})
				await commonHelper.generateNFT(course_id, req.user.id)
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
						price: courseDetails.nft_stripe_id,
						quantity: 1,
					},
				],
				mode: 'payment',
			}
			// check if discount have than add coupon code to stripe payment
			const stripeCheckoutData = await stripeHelper.createCheckout(
				paymentData
			)
			// add stripe payment id to course user table
			await paymentService.saveNftPurchaseData({
				course_id,
				transaction_id: stripeCheckoutData.payment_intent,
				purchase_with: 'stripe',
				user_id: req.user.id,
				status: 0,
				mct_price_at_purchase: mctPriceAtPurchase,
				address_id: address_id,
				amount: courseDetails.nft_purchase_price,
			})
			responseData.redirectUrl = stripeCheckoutData.url
		}
		return response.helper(res, true, 'CHECKOUT_SUCCESS', responseData, 200)
	} catch (err) {
		console.log(err)
		next(err)
	}
}

exports.checkoutControllerV1 = async (req, res, next) => {
	try {
		const {
			isCoinbase,
			isCreditCard,
			isMCTToken,
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
			transaction_id,
			courseIdList,
			isStripe,
			isCoursePack,
			isWalletPay,
			packId,
			referalUser,
			referalCode,
			checkOutWithMc,
			sourse,
			purchase_amount_usd,
			sales_agent,
		} = req.body
		logger.checkOutData(`Cart checkout api ${JSON.stringify(req.body)}`)
		if (!email) {
			return response.helper(res, false, 'EMAIL_REQUIRED', {}, 200)
		}
		const userExist = await userService.isEmailExist(email)
		if (userExist) {
			const user = await userService.userLoginData(userExist.id)
			req.user = user
		} else {
			const userRoleData = await userService.userRoleData('USR')
			const decryptPassword = commonHelper.rendomString()
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
						sales_agent,
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
				const stripeCheckoutData = await stripeHelper.createCheckout(
					paymentData
				)
				// add stripe payment id to course user table
				await courseService.userCourseUpdate(
					userPackage.dataValues.id,
					{
						stripe_id: stripeCheckoutData.payment_intent,
						address_id: address_id,
					}
				)
				responseData.redirectUrl = stripeCheckoutData.url
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
			const cartCourse = courseIdList
			const itemList = []
			const stripeIdList = []
			const totalAmount = {
				currency: 'USD',
				total: 0,
			}
			const courseHistoryList = []
			for (let i = 0; i < cartCourse.length; i++) {
				const courseId = cartCourse[i]
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
							...(checkOutWithMc && {
								mc_amount: walletData.token_balance,
								mct_price: mctPriceAtPurchase,
							}),
							purchase_amount_usd,
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
						let finalDlr = walletAmountInDlr
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
					totalAmount.total = totalAmount.total - walletAmountInDlr
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
							...(discountDetails && {
								used_discount_id: discountDetails.id,
							}),
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

exports.paritlaCheckoutV1 = async (req, res, next) => {
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

exports.partialCheckoutFiexd = async (req, res, next) => {
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
		} = req.body
		logger.checkOutData(`Partial checkout api ${JSON.stringify(req.body)}`)
		course_id = 38
		partialTime = 4
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
