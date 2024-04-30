const paypal = require('paypal-rest-sdk');
const config = require('../config/config');

paypal.configure({
  'mode': config.PAYPAL_MODE,
  'client_id': config.PAYPAL_CLIENT_ID,
  'client_secret': config.PAYPAL_CLIENT_SECRET,
});

module.exports.payment = async (paymentData) => {
  const create_payment_json = {
    'intent': 'sale',
    'payer': {
      'payment_method': 'paypal',
    },
    'redirect_urls': {
      'return_url': paymentData.source_url || 'http://localhost:3000/',
      'cancel_url': paymentData.source_url || 'http://localhost:3000/',
    },
    'transactions': [paymentData],
  };
  return new Promise((resolve, reject)=> {
    paypal.payment.create(create_payment_json, function(error, payment) {
      if (error) {
        reject(error);
      } else {
        resolve(payment);
      }
    });
  });
};

module.exports.getPaymentDetails = async (paymentId) => {
  return new Promise((resolve, reject) => {
    paypal.payment.get(paymentId, (err, payment) => {
      if (err) {
        reject(err);
      } else {
        resolve(payment);
      }
    });
  });
};
