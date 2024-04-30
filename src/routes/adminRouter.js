const { Router } = require('express')
const multer = require('multer')
const router = new Router()

const {
	getUserAssignedCourseList,
	getUsersAssignedToCourse,
	removeCourseAccessWithRefund,
	createCoinbasePaymentLink,
	coinbasePayments,
	stripePayments,
	mctPayments,
	getCourseLectures,
	removeLecture,
	removeModule,
	updateLectureSubModule,
	getSubModulesByModuleId,
	updateVatPercentage,
	getAllVatRates,
	getReferralCodesByCourseId,
	addNewReferralCode,
	deactivateCouponCode,
	addUpdateSalesAgentsCount,
	getSalesAgentsCount,
	updateUserCoursePaymentInfo,
} = require('../controller/admin.controller')
const {
	createCourse,
	createCourseModule,
	createCourseLecture,
	setModuleIndexForCourse,
	setLectureIndexForCourse,
	publishCourse,
	uploadQuestionsWithCSV,
	setExamQuestions,
	lectureDocumentUpdate,
	updateCorese,
	createCourseSubModule,
	setLectureThumbnailImage,
} = require('../controller/course.controller')
const {
	assignCourseToUser,
	userList,
	stripePaymentSummary,
	coinbasePaymentSummary,
	mctPaymentSummary,
	updateCourseModule,
	updateModuleLecture,
	listAllCourse,
	courseDetails,
	removeDocument,
	addWalletTokens,
	removeWalletTokens,
	removeCourseAccess,
	assignCourseToMintNft,
	userDetails,
	userListByCourse,
	userExamDetailsByCourse,
	pendingPaymentList,
	addUserAndAssignCourse,
} = require('../controller/admin.controller')
const authMiddleware = require('../middleware/auth-role')
const { listCourse } = require('../controller/public.controller')
const {
	getAllUsers,
	getStats,
	getGoogleSheetsData,
	getCoursesAssigned,
} = require('../controller/reports.controller')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const createCourseUploadObj = upload.fields([
	{
		name: 'url_image_thumbnail',
		maxCount: 1,
	},
	{
		name: 'url_image_mobile',
		maxCount: 1,
	},
	{
		name: 'url_image',
		maxCount: 1,
	},
])
const createLectureUploadObj = upload.fields([
	{
		name: 'documents',
		maxCount: 10,
	},
	{
		name: 'lec_video',
		maxCount: 1,
	},
	{
		name: 'video_thumbnail',
		maxCount: 1,
	},
])

router.use(authMiddleware('ADM'))
router.get('/course-list', listCourse) //listAllCourse)
router.get('/get-users-data', getUserAssignedCourseList)
router.post('/course', createCourseUploadObj, createCourse)
router.put('/course', upload.single('thumbnail'), updateCorese)
router.get('/course-details/:courseId', courseDetails)
router.get('/get-course-lectures/:courseId', getCourseLectures)
router.get('/get-sub-modules/:module_id', getSubModulesByModuleId)
router.post('/course-module', createCourseModule)
router.post('/course-sub-module', createCourseSubModule)
router.post('/course-lecture', createLectureUploadObj, createCourseLecture)
router.post('/set-module-index', setModuleIndexForCourse)
router.post('/set-lecture-index', setLectureIndexForCourse)
router.post('/update-lecture-thumbnail', setLectureThumbnailImage)
router.post('/publish-course', publishCourse)
router.post('/question', setExamQuestions)
router.post('/upload-questions-csv', uploadQuestionsWithCSV)
router.post('/assign-course', assignCourseToUser)
router.post('/assign-course-nft-min', assignCourseToMintNft)
router.put('/course-module', updateCourseModule)
router.put('/update-lecture-submodule', updateLectureSubModule)
router.put('/course-lecture', upload.single('lec_video'), updateModuleLecture)
router.put(
	'/course-lecture-document',
	upload.single('document'),
	lectureDocumentUpdate
)
router.put('/remove-document', removeDocument)
router.put('/remove-lecture', removeLecture)
router.put('/remove-module', removeModule)
router.post('/remove-course-access', removeCourseAccess)
router.post('/remove-course-refund', removeCourseAccessWithRefund)

router.get('/user-list', userList)
router.get('/user/:userId', userDetails)
router.get('/stripe-payment-summary', stripePaymentSummary)
router.get('/coinbase-payment-summary', coinbasePaymentSummary)
router.get('/mct-payment-summary', mctPaymentSummary)
router.post('/user-list-by-course', userListByCourse)
router.post('/user-exams-by-course', userExamDetailsByCourse)
router.get('/pending-payments', pendingPaymentList)

// mc wallet apis
router.post('/mc-wallet/add', addWalletTokens)
router.post('/mc-wallet/remove', removeWalletTokens)
router.post('/add-user-assign-course', addUserAndAssignCourse)
router.post('/get-users-Course', getUsersAssignedToCourse)

router.post('/create-coinbase-link', createCoinbasePaymentLink)

router.get('/coinbase-payments', coinbasePayments)
router.get('/stripe-payments', stripePayments)
router.get('/mct-payments', mctPayments)

router.post('/update-vat-percentage', updateVatPercentage)
router.get('/get-all-vatrates', getAllVatRates)
router.get('/get-all-referral-codes/:course_id', getReferralCodesByCourseId)
router.post('/add-new-referralcode', addNewReferralCode)
router.post('/delete-coupon-code', deactivateCouponCode)

router.get('/get-sales-agents-count/:course_id', getSalesAgentsCount)
router.post('/add-update-sa-count', addUpdateSalesAgentsCount)

router.post('/update-payment-info', updateUserCoursePaymentInfo)

//Reports
router.post('/get-all-users', getAllUsers)
router.post('/get-stats', getStats)
router.get('/get-googlesheets-data', getGoogleSheetsData)
router.get('/get-courses-assigned/:user_id', getCoursesAssigned)

module.exports = router
