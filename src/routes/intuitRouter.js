const { Router } = require('express')
const router = new Router()
const { callback } = require('../controller/intuit.controller')
const { bodyValidator } = require('../middleware/validator')
const { signupRequest } = require('../validator/common.validator')
const authorizer = require('../middleware/auth-role')

router.get('/callback', callback)

module.exports = router
