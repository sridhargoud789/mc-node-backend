const AWS = require("aws-sdk");
const config = require("../config/config");

AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_KEY,
  region: config.AWS_REGION,
});

const sendSMS = async (type, data) => {
  const params = {
    Message: '',
    PhoneNumber: data.mobileNo,
  };
  switch (type) {
    case "send-otp":
      params.Message = `Your One Time verification code is ${data.otp}. Do not share to anyone`;
      break;
  }
  try {
    console.log(params);
    return new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params)
    .promise()
    .then((data) => {
      console.log("data", data);
    })
    .catch((err) => {
      console.log("err", err);
    });
  } catch (err) {
    console.log("err", err);
  }
};

module.exports = {
  sendSMS
};
