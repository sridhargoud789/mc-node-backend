const cron = require('node-cron');
const dbObj = require('../../models/index');
const coinmarketcapHelper = require('../helpers/coinbase.helper');;
const userService = require('../dbService/user.service');
const commonHelper = require('../helpers/common.helper');
const courseService = require('../dbService/course.services');
const nftPurchaseModel = dbObj.nft_purchases;

cron.schedule('* * * * *', async () => {
  // logger.cron('Coinbase commerce partial pay cron start');
  try {
    const coinmarketCapData = await nftPurchaseModel.findAll({
        where: {
            status: 0,
            purchase_with: 'coinbase',
        },
        attributes: ['id', 'course_id',  
    'user_id', 'transaction_id', 'status', 'amount', 'mct_price_at_purchase'],
    logging: console.log,
    });
    const promiseList = [];
    const coinbasePaymentData = [];
    coinmarketCapData.forEach(eachcoinmarketCapPayment => {
        const coinmarketData = eachcoinmarketCapPayment.dataValues;
        const promise = new Promise(async (resolve, reject)=> {
            const data = await coinmarketcapHelper.getChargeData(coinmarketData.transaction_id);
            coinbasePaymentData.push({data, id: coinmarketData.id, code: coinmarketData.transaction_id});
            resolve(data);
        });
        promiseList.push(promise);
    });
    await Promise.all(promiseList);
    for(let i =0;i<coinbasePaymentData.length;i++) {
      const eachCoinbasePayment = coinbasePaymentData[i].data;
      const code = coinbasePaymentData[i].code;
      const id = coinbasePaymentData[i].id;
      const {payments, timeline} = eachCoinbasePayment;
      let isPaymentConfirm = false;
      timeline.forEach(eachTimeline=> {
        if(eachTimeline.status === 'COMPLETED') {
          isPaymentConfirm = true;
        }
      });
      if((payments && payments.length && payments[0].status == 'CONFIRMED' && isPaymentConfirm) || 1) {
        const paymentData = {
          body : {
            "event": {
                "data": {
                    "code": eachCoinbasePayment.code
                },
                "type": "charge:confirmed"
            }
          }
        }
        console.log('paymentData', paymentData);
        // logger.coinbaseCommerceChangeLog(`Code ${eachCoinbasePayment.code} change to payment success course_user id is ${id}`);
        await coinbaseCommerceWebhookLogic(paymentData);   
      } else {  
        const paymentTimeline = eachCoinbasePayment.timeline;
        let isCodeExpired = false;
        if(paymentTimeline) {
          paymentTimeline.forEach(eachTime => {
            if (eachTime.status === 'EXPIRED') {
              isCodeExpired = true;
            }
          });  
        } else {
          isCodeExpired = true;
        }
        if(isCodeExpired) {
          await nftPurchaseModel.update({
            status: 2,
          },{
            where: {
              status: 0,
              purchase_with: 'coinbase',
              transaction_id: eachCoinbasePayment.code,
            }
          });
        }
      }
    }
  } catch (err) {
    console.log('err', err);
  }
});


const coinbaseCommerceWebhookLogic = async (req) => {
  try {
    const paymentId = req.body.event.data.code;
    const paypalData = req.body.event;
    let userId;
  
    if (paypalData && paypalData?.type === 'charge:confirmed') {
    
      payment_with = 'coinbase';
      let nftPurchaseData =
				await nftPurchaseModel.findOne({
          where: {
             transaction_id: paymentId 
          },
          attributes: ['id', 'course_id',  
      'user_id', 'transaction_id', 'status', 'amount', 'mct_price_at_purchase']
      });
    
        userId = nftPurchaseData.user_id;
        const userData = await userService.userDetails(userId);
        const courseId = nftPurchaseData.course_id;

        const courseData = await courseService.courseDetails(
          courseId,
          'id'
        )
        await courseService.addUserTransaction({
					user_id: userId,
					transaction_id: paymentId,
					amount: courseData.nft_purchase_price,
					payment_with: 'coinbase',
				})
        await nftPurchaseModel.update({
          status: 1,
        },{
          where: {
            status: 0,
            purchase_with: 'coinbase',
            transaction_id: paymentId,
          }
        });
        await commonHelper.generateNFT(courseId, userId);
    }
  } catch (error) {
    console.log('error', error);
  }
}