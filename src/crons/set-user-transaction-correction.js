const cron = require('node-cron')
const logger = require('../config/logger.js')
const dbObj = require('../../models/index')
const userTransactionModel = dbObj.user_transactions
const courseService = require('../dbService/course.services');
const commonHelper = require('../helpers/common.helper');

let inProgress = false;
cron.schedule('* * * * *', async () => {
  if(inProgress) {
    return
  }
	inProgress = true;
  
  try {
		const uesrTransactions = await userTransactionModel.findAll({
			where: {
				amount: 2959
			}
		})
		for (let i = 0; i < uesrTransactions.length; i++) {
			let amount = 1987
			if(uesrTransactions[i].used_discount_id) {
				amount -= 39
			}
			console.log(`Update Amount is id ${uesrTransactions[i].id} change amount ${uesrTransactions[i].amount} to ${amount}`);
			await userTransactionModel.update({
				amount
			}, {
				where: {
					id: uesrTransactions[i].id
				}
			});
		}
    inProgress = false
  } catch (err) {
    inProgress = false
	}
})
