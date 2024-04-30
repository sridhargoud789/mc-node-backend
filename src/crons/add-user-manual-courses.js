const cron = require('node-cron')
const logger = require('../config/logger.js')
const dbObj = require('../../models/index')
const userTransactionModel = dbObj.user_transactions
const courseService = require('../dbService/course.services');
const commonService = require('../dbService/common.service');
const commonHelper = require('../helpers/common.helper');
const userService = require('../dbService/user.service');

let inProgress = false;
// cron.schedule('* * * * *', async () => {
(async () => {

	if(!inProgress) {
		inProgress = true;
	}
  try {

	const tokenAv = await commonService.calculateTokenAvg();
    const responseData = commonHelper.avgPriceOfMCT(tokenAv);
    const mctAmount = responseData.price;
  
	const emails = (`larfranco14@gmail.com
	jan0vega@gmail.com
	edumatanza5@icloud.com`).split('\n');
	console.log('emai', emails.length);
	const courseIds = [52];
	let count =0
	for(let i=0;i<emails.length;i++) {
		const userDetails = await userService.isEmailExist(emails[i].trim());
		if(userDetails) {
			count ++;
			console.log('email', emails[i]);
			// continue;
			for (let i = 0; i < courseIds.length; i++) {
				let userId = userDetails.id;
				const courseId = courseIds[i];
				const isCourseWithSameName = await courseService.courseDetails(
					courseId,
					'id',
				);
				if (!isCourseWithSameName) {
				  continue;
				}
				const isCourseAlreadyPurchased =
							await courseService.userCourseData(
							  courseId,
							  userId
							);
				if (isCourseAlreadyPurchased) {
				  continue;
				}
				let purchaseAmount =  Number(isCourseWithSameName.price / mctAmount).toFixed(2);
				// let rewardAmount = isCourseWithSameName.price +( (isCourseWithSameName.price * 20) / 100);
				const historyUser = {
					course_id: courseId,
					user_id: userId,
					stripe_id: 'Manual_Add_By_Admin',
					status: 1,
				}
				console.log('historyUser', historyUser);
				await courseService.addCourseToUserTransaction(historyUser);
				const prepareCourseHistory = {
				  course_id: courseId,
				  user_id: userId,
				  started_at: '2023-05-01',
				  completed_at: '2023-05-05',
				  purchased_amount: purchaseAmount, // storing in mct
				  reward_amount:0,
				  progress: 100,
				  total_reward_earned: 0,
				  mct_price_at_purchase: mctAmount,
				  transaction_id: 'Manual_Add_By_Admin',
				};
				console.log('pere', prepareCourseHistory);

				await courseService.addCourseToUserData(prepareCourseHistory);
				
			  }
		}
	}
	console.log(count);
} catch (err) {
	console.log('err', err);
	inProgress = false ;

}
inProgress = false ;
})()
// })
