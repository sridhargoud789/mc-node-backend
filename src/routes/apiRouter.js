const {Router} = require('express');
const router = new Router();
const { coinListBySearch, listCategory,
  listCourse, listPublicTestimonials, listNoticeCategory, listArticleCategory, courseDetails, searchCourse,
  listPackages, packageDetails, validateCoinbase} =
    require('../controller/public.controller');

router.get('/categories', listCategory);
router.get('/notice-categories', listNoticeCategory);
router.get('/article-categories', listArticleCategory);
router.get('/course-list', listCourse);
router.get('/testimonials', listPublicTestimonials);
router.get('/course-details/:courseId', courseDetails);
router.get('/search', searchCourse);
router.get('/package-list', listPackages);
router.get('/package-details/:packageId', packageDetails);
router.get('/cryptocurrencies/coins', coinListBySearch);
router.post('/coinbase-validate', validateCoinbase);
module.exports = router;
