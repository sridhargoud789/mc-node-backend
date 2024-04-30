const { Router } = require('express')
const router = new Router()
const authorizer = require('../middleware/auth-role')
const multer = require('multer')
const {
	editUserProfile,
	userInfo,
	resetPassword,
	uploadProfilePic,
	courseToCart,
	userCartList,
	removeToCart,
	userLectureVideoAccess,
	updateUserLastWatchCourse,
	checkOutCart,
	requestForCourseExam,
	requestForExamStart,
	submitExamAns,
	listMyCourses,
	endLectureController,
	courseToWish,
	userWishList,
	removeToWish,
	userCourseInit,
	verifyPaypalOrder,
	completeExam,
	userExamResult,
	purchaseCourseStripe,
	checkPaymentStatus,
	claimUserReward,
	makeUserWalletDefault,
	verifyWalletAndLink,
	listUserWallets,
	removeWalletFromUser,
	usersAddressList,
	notficationSettingUpdate,
	userRemoveAddress,
	invoiceList,
	privacyPolicyUpdate,
	linkEmailToWallet,
	isCourseAlreadyBought,
	earlyChekout,
	addActiveCampagineTalkToExpert,
	validateUserTransaction,
	startCourseRequest,
	mintUserNFT,
	downloadUserNFT,
	saveUserReport,
	completeCourseReuqest,
	partialCheckout,
	checkReferralCodeValid,
	checkMctDiscount,
	publicCoursePurchase,
	walletDetails,
	redeemMcToken,
	downloadCourseContent,
	updateDiscodName,
	updateEmployeeType,
	collectMcWalletReward,
	getquestionsAnswers,
	createquestions,
	updateQuestionAnswer,
	approveQuestionAnswer,
	addQuestionComments,
	addQuestionLike,
	createAnnouncement,
	updateAnnouncement,
	addAnnouncementComments,
	createCourseNotes,
	getCourseAnnouncements,
	getCourseNotes,
	getQAAdmin,
	specialPartialCheckout,
	specialPartialCheckoutv1,
	updateUserMandate,
	updateUsertelgramSubmitted,
	resetFormModule,
	resetCompleteModule,
	createUserController,
	getExamUserResults,
	deleteQuestionAnswer,
	getUserInvoices,
} = require('../controller/user.controller')

const {
	sendOtp,
	verifyOtp,
	saveUserMarketingDetails,
	purchasePriceInDoller,
} = require('../controller/public.controller')

const {
	nftCheckout,
	checkoutControllerV1,
	paritlaCheckoutV1,
	partialCheckoutFiexd,
} = require('../controller/payment.controller')

const {
	getUserCourseRemainders,
	enableRemainderNotifications,
	getCourseLectures,
	getVatRateByCode,
} = require('../controller/course.controller')

const {
	paypalWebhookController,
	stripeWebhookController,
	coinbaseWebhookController,
} = require('../controller/webhook.conroller')
const { validateCourseWithUser } = require('../middleware/common.middleware')
const {
	addUserAndAssignCourse,
	hotMartController,
} = require('../controller/admin.controller')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)

router.post('/link-email', authorizer(), linkEmailToWallet)
router.post('/edit-profile', authorizer(), editUserProfile)
router.get('/', authorizer(), userInfo)
router.put('/discod-name', authorizer(), updateDiscodName)
router.post('/employee-type', authorizer(), updateEmployeeType)
router.post('/reset-moduleforms', authorizer(), resetFormModule)
router.post('/reset-complete-formmodules', authorizer(), resetCompleteModule)

router.post('/create-user-admin', authorizer(), createUserController)

router.post('/mandate-qa', authorizer(), updateUserMandate)
router.post('/telegram-submitted', authorizer(), updateUsertelgramSubmitted)
router.post('/reset-password', authorizer(), resetPassword)
router.post(
	'/upload-profile-pic',
	authorizer(),
	upload.single('profile_picture'),
	uploadProfilePic
)
router.put('/notification-setting', authorizer(), notficationSettingUpdate)
router.put('/privacy-policy', authorizer(), privacyPolicyUpdate)
router.get('/invoices', authorizer(), invoiceList)
router.get('/wallet-info', authorizer(), walletDetails)

// cart list api
router.post('/cart', authorizer(), courseToCart)
router.get('/cart/list', authorizer(), userCartList)
router.delete('/cart', authorizer(), removeToCart)
router.post('/redeem-mc-token', authorizer(), redeemMcToken)

// wish list api
router.post('/wish', authorizer(), courseToWish)
router.get('/wish/list', authorizer(), userWishList)
router.delete('/wish', authorizer(), removeToWish)

// course list api
router.get('/my-courses', authorizer(), listMyCourses)

// cart checkout and payment api
router.post('/cart-checkout', authorizer(), checkOutCart)
router.post('/cart-checkout-v1', checkoutControllerV1)
router.post('/early-checkout', authorizer(), earlyChekout)
router.post('/paypal-webhook', paypalWebhookController)
router.post('/hotmart-webhook', hotMartController)
router.post('/coinbase-webhook', coinbaseWebhookController)
router.post('/stripe-webhook', stripeWebhookController)
router.post('/payment-verify', authorizer(), verifyPaypalOrder)
router.post('/validate-transaction', validateUserTransaction)
router.post('/is_already_buy', isCourseAlreadyBought)
router.post('/partial-pay', authorizer(), partialCheckout)
router.post('/partial-pay-v1', paritlaCheckoutV1)
router.post('/partial-pay-fixed', partialCheckoutFiexd)
router.post('/start-public-course', authorizer(), publicCoursePurchase)
router.post('/check-referral', checkReferralCodeValid)
router.post('/check-mct-discount', authorizer(), checkMctDiscount)
router.post('/nft-purchase-checkout', authorizer(), nftCheckout)
router.post('/collect-mc-wallet-reward', authorizer(), collectMcWalletReward)

router.post('/special-partial-pay', authorizer(), specialPartialCheckout)
router.post('/special-partial-pay-v1', specialPartialCheckoutv1)

// course init api
router.post('/start-course-request', authorizer(), startCourseRequest)
router.put('/complete-course-request', authorizer(), completeCourseReuqest)
router.post('/course-init', authorizer(), userCourseInit) // validateCourseWithUser,
router.post('/lecture-video-access', authorizer(), userLectureVideoAccess)
router.post('/update-last-watch', authorizer(), updateUserLastWatchCourse)
router.post('/request-exam', authorizer(), requestForCourseExam)
router.put('/start-exam', authorizer(), requestForExamStart)
router.put('/submit-answer', authorizer(), submitExamAns)
router.put('/end-lecture', authorizer(), endLectureController)
router.put('/complete-exam', authorizer(), completeExam)
router.post('/exam-result', authorizer(), userExamResult)
router.post('/clain-rewards', authorizer(), claimUserReward)
router.post('/mint-nft', authorizer(), mintUserNFT)
router.post('/download-nft', authorizer(), downloadUserNFT)
router.post('/save-exam-reports', authorizer(), saveUserReport)

// wallet api
router.post('/wallet/default', authorizer(), makeUserWalletDefault)
router.post('/wallet/verify', authorizer(), verifyWalletAndLink)
router.get('/wallet/list', authorizer(), listUserWallets)
router.delete('/wallet', authorizer(), removeWalletFromUser)

// addr
router.get('/address-list', authorizer(), usersAddressList)
router.delete('/address', authorizer(), userRemoveAddress)
router.post('/expert-talk', authorizer(), addActiveCampagineTalkToExpert)

router.post('/save-marketing-detals', saveUserMarketingDetails)

// router.post('/get-purchase-price', purchasePriceInDoller);
// router.post('/download-course-content', authorizer(), downloadCourseContent)
// router.post('/purchase-course-stripe',authorizer(), purchaseCourseStripe);
// router.post('/check-payment-status',  checkPaymentStatus);

router.post('/get-question-answers', authorizer(), getquestionsAnswers)
router.post('/add-question-answers', authorizer(), createquestions)
router.post('/update-question-answers', authorizer(), updateQuestionAnswer)
router.post('/approve-question-answers', authorizer(), approveQuestionAnswer)

router.post('/delete-question-answers', authorizer(), deleteQuestionAnswer)

router.post('/add-question-comments', authorizer(), addQuestionComments)
router.post('/add-question-like', authorizer(), addQuestionLike)

router.post('/get-announcements', authorizer(), getCourseAnnouncements)
router.post('/add-announcement', authorizer(), createAnnouncement)
router.post('/update-announcement', authorizer(), updateAnnouncement)
router.post('/add-announcement-comments', authorizer(), addAnnouncementComments)
router.post('/add-course-notes', authorizer(), createCourseNotes)
router.post('/get-notes', authorizer(), getCourseNotes)

router.post('/get-admin-aq', authorizer(), getQAAdmin)

router.post('/get-course-remainders', authorizer(), getUserCourseRemainders)
router.post(
	'/enable-course-notifications',
	authorizer(),
	enableRemainderNotifications
)

router.post('/get-user-exam-results', authorizer(), getExamUserResults)

router.get('/user-invoices', authorizer(), getUserInvoices)
router.get('/get-course-lectures/:courseId', getCourseLectures)
router.get('/get-country-vat/:code', getVatRateByCode)
module.exports = router
