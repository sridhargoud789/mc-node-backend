const config = require('../config/config');
const stripe = require('stripe')(config.STRIPE_KEY);

const createProduct = async (productData) => {
  const product = await stripe.products.create(productData);
  return product;
};

const createPrice = async (priceData) => {
  const price = await stripe.prices.create({
    unit_amount: priceData.price * 100,
    currency: priceData.currency || 'usd',
    product: priceData.productId,
  });
  return price;
};

const createCheckout = async (checkoutData) => {
  const session = await stripe.checkout.sessions.create({
    success_url: checkoutData.successUrl || 'https://example.com/success',
    cancel_url: checkoutData.cancelUrl || 'https://example.com/cancel',
    line_items: checkoutData.listItems || [],
    mode: 'payment',
    ...(checkoutData.discounts && {discounts: checkoutData.discounts}),
    metadata: {
      ...(checkoutData.discounts && {discounts: checkoutData.discounts[0].coupon})
    }
  });
  return session;
};

const updatePriceToProduct = async (priceId, productId) => {
  const product = await stripe.products.update(productId, {
    metadata: {
      default_price: priceId,
    },
  });
  return product;
};

const createCoupon = async (couponData) => {
  const coupon = await stripe.coupons.create({
    amount_off: couponData.amount * 100,
    duration: couponData.durationType || 'forever',
    currency: couponData.currency || 'usd',
  }) ;
  return coupon;
}

const getCoupon = async (couponCode) => {
  const coupon = await stripe.coupons.retrieve(
    couponCode
  );
  return coupon;
}

const getPaymentData = async (paymentIntentId) => {
  console.log('paymentIntentId', paymentIntentId);
  const data = await stripe.paymentIntents.retrieve(
    paymentIntentId
  );
  return (data.amount_received / 100)
}

module.exports = {
  getPaymentData,
  getCoupon,
  createCoupon,
  createPrice,
  createProduct,
  createCheckout,
  updatePriceToProduct,
};
