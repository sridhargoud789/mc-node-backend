const cron = require('node-cron')
const logger = require('../config/logger.js')
const dbObj = require('../../models/index')
const historyCourseUsersModel = dbObj.history_user_courses;
const courseUserModel = dbObj.courses_users;
const historyUserCoursesModel = dbObj.history_user_courses;
 const courseModel = dbObj.courses;
const courseService = require('../dbService/course.services');
const commonHelper = require('../helpers/common.helper');

let inProgress = false;
cron.schedule('* * * * *', async () => {
  if(inProgress) {
    return
  }
	inProgress = true;
  // 1987
  try {
		const uesrTransactions = await courseUserModel.findAll({
			where: {
				package_id: 1,
				status: 1
			},
			attributes:['id', 'user_id']
		});
		console.log('uesrTransactions', uesrTransactions.length);
		for (let i = 0; i < uesrTransactions.length; i++) {
			const amount = 1987 / 7;
			console.log('user_id', uesrTransactions[i].user_id);
			const usersCourse = await historyUserCoursesModel.findAll({
				where: {
					user_id: uesrTransactions[i].user_id
				}
			});
			for(let j=0;j<usersCourse.length;j++) {
				let changeAmount = amount / usersCourse[j].mct_price_at_purchase;
							console.log(`Update Amount is id ${usersCourse[j].id} change amount ${usersCourse[j].purchased_amount} to ${changeAmount}`);
				await historyCourseUsersModel.update({
							purchased_amount: changeAmount
						}, {
							where: {
								id: usersCourse[j].id
							}
						});
			}
		}
		// const userCourses = await historyCourseUsersModel.findAll({
		// 	include: [
		// 		{
		// 			model: courseModel,
		// 			as: 'courseData',
		// 			attributes: ['price', 'id']
		// 		}
		// 	],
		// 	attributes: ['purchased_amount', 'id', 'mct_price_at_purchase']
		// });
		// for (let i = 0; i < userCourses.length; i++) {
		// 	let changeAmount = userCourses[i].courseData.price / userCourses[i].mct_price_at_purchase;

		// 	console.log(`Update Amount is id ${userCourses[i].id} change amount ${userCourses[i].purchased_amount} to ${changeAmount}`);
		// 	// await historyCourseUsersModel.update({
		// 	// 	purchased_amount: changeAmount
		// 	// }, {
		// 	// 	where: {
		// 	// 		id: userCourses[i].id
		// 	// 	}
		// 	// });
		// }
    inProgress = false
  } catch (err) {
	console.log('err', err);
    inProgress = false
	}
})
