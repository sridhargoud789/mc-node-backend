const {Router} = require('express');
const router = new Router();
const {loginController, signupController, web3LoginController, forgotpasswordController, changepasswordController, checkAuthToken, getTokenValue} = require('../controller/public.controller');
const {bodyValidator} = require('../middleware/validator');
const {signupRequest} = require('../validator/common.validator');
const authorizer = require('../middleware/auth-role');

router.post('/login', loginController);
router.post('/web3-login', web3LoginController);
router.post('/signup', bodyValidator(signupRequest), signupController);
router.post('/forgot-password', forgotpasswordController);
router.post('/change-password', changepasswordController);
router.get('/token-value', getTokenValue);
router.post('/check-auth-token', checkAuthToken);

module.exports = router;
