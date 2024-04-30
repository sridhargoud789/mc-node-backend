const en = require('../config/messages/en');
const spn = require('../config/messages/spn');
/**
 * Response class for handing response
 */
class response {
  static helper(res, isSuccess, message, data, status, language = 0) {
    if ( message === '_SUCCESS' && status === 200) {
      return res.status(status).send(data);
    } else {
      let finalMsg = response.getLanguageMessage(language, message);
      finalMsg = finalMsg ? finalMsg : message;
      return res.status(status).send({
        isSuccess,
        message: finalMsg,
        data,
      });
    }
  }

  static getLanguageMessage = (language, message) => {
    if (language === 1) {
      return spn[`${message}`];
    } else {
      return en[`${message}`];
    }
  };

  static notFound(req, res) {
    return res.status(404).send();
  }
}

module.exports = response;
