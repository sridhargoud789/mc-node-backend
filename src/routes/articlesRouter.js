const { Router } = require('express')
const multer = require('multer')
const router = new Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const authorizer = require('../middleware/auth-role')

const {
	getAllCourseArticles,
	getPublishedCourseArticles,
	addCourseArticle,
	updateCourseArticle,
	getAllArticlesModules,
	addArticleModule,
	updateArticleModule,
	getArticleDetailsBySlugEN,
	getArticleDetailsBySlugES,
	getArticleDetailsById,
	getAllArticleTags,
} = require('../controller/course_article.controller')

const authMiddleware = require('../middleware/auth-role')

router.get('/get-all-articles', authorizer(), getAllCourseArticles)
router.post('/get-article-details', authorizer(), getArticleDetailsById)
router.post('/get-published-articles', getPublishedCourseArticles)
router.post('/add-article', authorizer(), addCourseArticle)
router.post('/update-article', authorizer(), updateCourseArticle)

router.post('/get-article-modules', getAllArticlesModules)

router.post('/add-article-module', authorizer(), addArticleModule)
router.post('/update-article-module', authorizer(), updateArticleModule)

router.post('/get-article-details-en', getArticleDetailsBySlugEN)
router.post('/get-article-details-es', getArticleDetailsBySlugES)
router.get('/get-article-tags', getAllArticleTags)
module.exports = router
