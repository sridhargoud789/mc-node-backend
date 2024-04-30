const { Router } = require('express')
const publicRouter = require('./publicRouter')
const apiRouter = require('./apiRouter')
const userRouter = require('./userRouter')
const instructorRouter = require('./instructorRouter')
const adminRouter = require('./adminRouter')
const articlesRouter = require('./articlesRouter')
const intuitRouter = require('./intuitRouter')

const router = new Router()
const { CONSTANT_ROUTERS } = require('../config/constants')

router.use(CONSTANT_ROUTERS.PUBLIC, publicRouter)
router.use(CONSTANT_ROUTERS.API, apiRouter)
router.use(CONSTANT_ROUTERS.API_USER, userRouter)
router.use(CONSTANT_ROUTERS.INSTRUCTOR, instructorRouter)
router.use(CONSTANT_ROUTERS.ADMIN, adminRouter)
router.use(CONSTANT_ROUTERS.ARTICLE, articlesRouter)
router.use(CONSTANT_ROUTERS.INTUIT, intuitRouter)

module.exports = router
