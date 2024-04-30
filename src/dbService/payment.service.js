const { Op } = require('sequelize')
const dbObj = require('../../models/index')
const stripeHelper = require('../helpers/stripe.helper')
const coinbaseHelper = require('../helpers/coinbase.helper')
const paymentInstallmentModel = dbObj.payment_installments
const nftPurchaseModel = dbObj.nft_purchases
const courseUserModel = dbObj.courses_users
const userAdderssModel = dbObj.users_addresses
const userModel = dbObj.users
const courseModel = dbObj.courses
const historyUserCourseModel = dbObj.history_user_courses

exports.savePaymentInstallment = async (
	user_id,
	course_id,
	transaction_id,
	amount,
	mct_amount_on_purchase,
	payment_with,
	status = 'pending',
	is_full_pay
) => {
	return await paymentInstallmentModel.create({
		user_id,
		course_id,
		transaction_id,
		amount,
		mct_amount_on_purchase,
		payment_with,
		status,
		is_full_pay: is_full_pay ? 1 : 0,
	})
}

exports.paymentInstallments = async (courseId, userId) => {
	return await paymentInstallmentModel.findAll({
		where: {
			course_id: courseId,
			user_id: userId,
		},
	})
}

exports.updatePayment = async (paymentId, updateData) => {
	return await paymentInstallmentModel.update(updateData, {
		where: {
			id: paymentId,
		},
	})
}

exports.saveNftPurchaseData = async (purchaseData) => {
	return await nftPurchaseModel.create(purchaseData)
}

exports.nftPurchaseDetailsByUserCourse = async (user_id, course_id) => {
	return await nftPurchaseModel.findOne({
		where: {
			user_id,
			course_id,
		},
	})
}

exports.stripePayments = async () => {
	const data = await courseUserModel.findAll({
		where: {
			[Op.and]: [
				{
					stripe_id: {
						[Op.not]: null,
					},
				},
				{
					stripe_id: {
						[Op.ne]: 'Public_Course',
					},
				},
				{
					stripe_id: {
						[Op.ne]: 'Manual_Add_By_Admin',
					},
				},
			],
		},
		attributes: [
			'id',
			'stripe_id',
			'created_at',
			'user_ip',
			'address_id',
			'status',
			'user_id',
		],
		include: [
			{
				model: userAdderssModel,
				as: 'addressData',
				attributes: [
					'id',
					'address_line_1',
					'address_line_2',
					'state',
					'zip_code',
					'country',
				],
			},
		],
		logging: console.log,
		order: [['id', 'ASC']],
	})
	const finalData = []
	let count = 0
	for (let i = 0; i < data.length; i++) {
		try {
			console.log('stripe_id', data[i].stripe_id)
			if (!data[i].stripe_id) {
				continue
			}
			console.log(i)
			const amount = await stripeHelper.getPaymentData(data[i].stripe_id)
			console.log('amount', amount)
			if (amount != 0) {
				count++
				const temp = {
					...data[i].dataValues,
				}
				temp.created_at = new Date(data[i].created_at).getTime()
				console.log(count)
				const userDetails = await userModel.findOne({
					where: {
						id: data[i].user_id,
					},
					attributes: ['name', 'email', 'phone_number'],
				})
				const courseDetails = await courseUserModel.findAll({
					where: {
						stripe_id: data[i].stripe_id,
					},
					attributes: ['course_id', 'discount_id', 'package_id'],
					include: [
						{
							model: courseModel,
							as: 'course',
							attributes: ['id', 'name'],
						},
					],
				})

				let courseName = ''
				courseDetails.forEach((eachC) => {
					if (eachC.discount_id) {
						courseName = 'X-PACK-DISCOUNT'
					} else if (eachC.package_id) {
						courseName = 'XMAS PACK'
					} else {
						courseName =
							courseName != ''
								? ` , ${eachC?.course?.name}`
								: eachC?.course?.name
					}
				})
				temp.courseName = courseName
				temp.userName = userDetails.name
				;(temp.phone_number = userDetails.phone_number),
					(temp.email = userDetails.email)
				temp.amount = amount
				finalData.push(temp)
			}
		} catch (error) {
			console.log(error)
		}
	}
	console.log('total', count)
	return finalData
}

exports.coinbasePayments = async () => {
	const data = await courseUserModel.findAll({
		where: {
			[Op.and]: [
				{
					status: 1,
				},
				{
					coinbase_id: {
						[Op.not]: null,
					},
				},
				{
					coinbase_id: {
						[Op.ne]: 'Public_Course',
					},
				},
				{
					coinbase_id: {
						[Op.ne]: 'Manual_Add_By_Admin',
					},
				},
			],
		},
		attributes: [
			'id',
			'coinbase_id',
			'created_at',
			'user_ip',
			'address_id',
			'status',
			'user_id',
		],
		include: [
			{
				model: userAdderssModel,
				as: 'addressData',
				attributes: [
					'id',
					'address_line_1',
					'address_line_2',
					'state',
					'zip_code',
					'country',
				],
			},
		],
		logging: console.log,
		order: [['id', 'ASC']],
	})
	const finalData = []
	let count = 0
	for (let i = 0; i < data.length; i++) {
		console.log('coinbase_id', data[i].coinbase_id)
		if (!data[i].coinbase_id) {
			continue
		}
		console.log(i)
		let amount = 0.1
		try {
			amount = await coinbaseHelper.getChargeData(data[i].coinbase_id)
		} catch (err) {
			console.log(data[i].coinbase_id)
			console.log(err)
		}

		console.log('amount', amount)
		if (amount != 0) {
			count++
			const temp = {
				...data[i].dataValues,
			}
			temp.created_at = new Date(data[i].created_at).getTime()
			console.log(count)
			const userDetails = await userModel.findOne({
				where: {
					id: data[i].user_id,
				},
				attributes: ['name', 'email', 'phone_number'],
			})
			const courseDetails = await courseUserModel.findAll({
				where: {
					coinbase_id: data[i].coinbase_id,
				},
				attributes: ['course_id', 'discount_id', 'package_id'],
				include: [
					{
						model: courseModel,
						as: 'course',
						attributes: ['id', 'name'],
					},
				],
			})

			let courseName = ''
			courseDetails.forEach((eachC) => {
				if (eachC.discount_id) {
					courseName = 'X-PACK-DISCOUNT'
				} else if (eachC.package_id) {
					courseName = 'XMAS PACK'
				} else {
					courseName =
						courseName != ''
							? `${courseName} , ${eachC?.course?.name}`
							: eachC?.course?.name
				}
			})
			temp.courseName = courseName
			temp.userName = userDetails.name
			;(temp.phone_number = userDetails.phone_number),
				(temp.email = userDetails.email)
			temp.amount = amount
			finalData.push(temp)
		}
	}
	console.log('total', count)
	return finalData
}

exports.mctPayments = async () => {
	const data = await courseUserModel.findAll({
		where: {
			[Op.and]: [
				{
					status: 1,
				},
				{
					transaction_id: {
						[Op.not]: null,
					},
				},
				{
					transaction_id: {
						[Op.ne]: '',
					},
				},
				{
					transaction_id: {
						[Op.ne]: 'Manual_Add_By_Admin',
					},
				},
			],
		},
		attributes: [
			'id',
			'transaction_id',
			'created_at',
			'user_ip',
			'address_id',
			'status',
			'user_id',
		],
		include: [
			{
				model: userAdderssModel,
				as: 'addressData',
				attributes: [
					'id',
					'address_line_1',
					'address_line_2',
					'state',
					'zip_code',
					'country',
				],
			},
		],
		logging: console.log,
		order: [['id', 'ASC']],
	})
	const finalData = []
	let count = 0
	for (let i = 0; i < data.length; i++) {
		console.log('transaction_id', data[i].transaction_id)
		if (!data[i].transaction_id) {
			continue
		}
		console.log(i)
		let amount = 0.1
		try {
			amount = await historyUserCourseModel.findOne({
				where: {
					user_id: data[i].user_id,
				},
			})
		} catch (err) {
			console.log(data[i].transaction_id)
			console.log(err)
		}

		console.log('amount', amount)
		if (amount != 0) {
			count++
			const temp = {
				...data[i].dataValues,
			}
			temp.created_at = new Date(data[i].created_at).getTime()
			console.log(count)
			const userDetails = await userModel.findOne({
				where: {
					id: data[i].user_id,
				},
				attributes: ['name', 'email', 'phone_number'],
			})
			const courseDetails = await courseUserModel.findAll({
				where: {
					transaction_id: data[i].transaction_id,
				},
				attributes: ['course_id', 'discount_id', 'package_id'],
				include: [
					{
						model: courseModel,
						as: 'course',
						attributes: ['id', 'name'],
					},
				],
			})

			let courseName = ''
			courseDetails.forEach((eachC) => {
				if (eachC.discount_id) {
					courseName = 'X-PACK-DISCOUNT'
				} else if (eachC.package_id) {
					courseName = 'XMAS PACK'
				} else {
					courseName =
						courseName != ''
							? `${courseName} , ${eachC?.course?.name}`
							: eachC?.course?.name
				}
			})
			temp.courseName = courseName
			temp.userName = userDetails.name
			;(temp.phone_number = userDetails.phone_number),
				(temp.email = userDetails.email)
			temp.amount = amount
			finalData.push(temp)
		}
	}
	console.log('total', count)
	return finalData
}
