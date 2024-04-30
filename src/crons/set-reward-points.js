const cron = require('node-cron')
const logger = require('../config/logger.js')
const dbObj = require('../../models/index')
const historyCoursesModel = dbObj.history_user_courses
const courseService = require('../dbService/course.services');
const commonHelper = require('../helpers/common.helper');

let inProgress = false;
cron.schedule('* * * * *', async () => {
	logger.rewardPointLogger('Cron to set reward points')
  if(inProgress) {
    return
  }
	inProgress = true;
  
  try {
		const courseUsers = await historyCoursesModel.findAll({})
		for (let i = 0; i < courseUsers.length; i++) {
			if([1697,1890,1480,3086, 1506,1555, 2899, 1686,3201, 2213, 1315, 3121, 2966, 1270, 1672, 1721].includes(courseUsers[i].user_id)) {
				console.log('userId', courseUsers[i].user_id);

			await courseService.updateUserCourseData(courseUsers[i].id, {
     			reward_amount: (courseUsers[i].purchased_amount + ( courseUsers[i].purchased_amount * 0.20 )) ,
			});
      logger.rewardPointLogger(`history course id ${courseUsers[i].id} changing reward point from ${courseUsers[i].reward_amount} to ${courseUsers[i].mct_price_at_purchase * 0.20}`)
			}
			

		}
    inProgress = false
  } catch (err) {
    inProgress = false
		logger.rewardPointLogger(`Error in reward set cron log ${err}`)
	}
})

1987 / 6 