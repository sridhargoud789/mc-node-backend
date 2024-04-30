const cron = require('node-cron')
const logger = require('../config/logger.js')
const dbObj = require('../../models/index')
const historyCourseUsersModel = dbObj.history_user_courses;
const courseModel = dbObj.courses;
const courseService = require('../dbService/course.services');
const commonHelper = require('../helpers/common.helper');

let inProgress = false;
cron.schedule('* * * * *', async () => {
  if(inProgress) {
    return
  }
	inProgress = true;
  
  try {
		const userCourses = await historyCourseUsersModel.findAll({
			include: [
				{
					model: courseModel,
					as: 'courseData',
					attributes: ['price', 'id']
				}
			],
			attributes: ['purchased_amount', 'id', 'mct_price_at_purchase']
		});
		for (let i = 0; i < userCourses.length; i++) {
			let changeAmount = userCourses[i].courseData.price / userCourses[i].mct_price_at_purchase;

			console.log(`Update Amount is id ${userCourses[i].id} change amount ${userCourses[i].purchased_amount} to ${changeAmount}`);
			await historyCourseUsersModel.update({
				purchased_amount: changeAmount
			}, {
				where: {
					id: userCourses[i].id
				}
			});
		}
    inProgress = false
  } catch (err) {
	console.log('err', err);
    inProgress = false
	}
})
