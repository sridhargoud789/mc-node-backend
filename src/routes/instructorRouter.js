const {Router} = require('express');
const router = new Router();
const multer = require('multer');
const {
  createCourse,
  createCourseModule,
  createCourseLecture,
  setModuleIndexForCourse,
  setLectureIndexForCourse,
  unpublishCourse,
  publishCourse,
  updateCorese,
  updateModule,
  updateLecture,
  setExamQuestions,
  versionReleaseCourse,
  setExamForModule,
  updateExamForModule,
  deleteExam,
  createCoursePackages,
  setExamShuffleIndex,
  uploadLecturesWithCSV,
  uploadMultipuleVideo,
  uploadQuestionsWithCSV,
  updateMCTHolders,
  coursePurchaseSummary,
  lectureDocumentUpdate,
} = require('../controller/course.controller');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
var storagecsv = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    console.log('file', file);
    const ext = file.originalname.split('.');
    const ex = ext[ext.length - 1];
    cb(null, file.fieldname + '-' + Date.now()+'.'+ex)
  }
})
const csvStorage = multer({
  storage: storagecsv
})
router.post('/course', upload.fields([
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
]), createCourse);
router.post('/course-module', createCourseModule);
router.post(
    '/course-lecture',
    upload.fields([
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
    ]),
    createCourseLecture,
);
router.post('/set-module-index', setModuleIndexForCourse);
router.post('/set-lecture-index', setLectureIndexForCourse);
router.post('/create-packages', createCoursePackages);
router.put('/course', updateCorese);
router.put('/course-module/:moduleId', updateModule);
router.put('/course-lecture/:lectureId', updateLecture);
router.put('/lecture-document-add',upload.single('document'), lectureDocumentUpdate);
router.post('/upload-lectures-csv', csvStorage.single('csv-file'), uploadLecturesWithCSV);
router.post('/upload-questions-csv', uploadQuestionsWithCSV);
router.post('/upload-multipule-video', upload.fields([
  {
    name: 'v1',
    maxCount: 1,
  },
  {
    name: 'v2',
    maxCount: 1,
  },
  {
    name: 'v3',
    maxCount: 1,
  },
  {
    name: 'v4',
    maxCount: 1,
  }, {
    name: 'v5',
    maxCount: 1,
  }, {
    name: 'v6',
    maxCount: 1,
  }, {
    name: 'v7',
    maxCount: 1,
  }, {
    name: 'v8',
    maxCount: 1,
  }, {
    name: 'v9',
    maxCount: 1,
  }, {
    name: 'v10',
    maxCount: 1,
  },{
    name: 'thumbnail',
    maxCount: 1
  }
]), uploadMultipuleVideo);
// router.put('/unpublish-course', unpublishCourse);
// router.post('/publish-course', publishCourse);
// router.post('/version-release-course', versionReleaseCourse);
router.get('/course-purchase-summary', coursePurchaseSummary);
router.post('/exam', setExamForModule);
router.post('/set-shuffle-index', setExamShuffleIndex);
router.post('/question', setExamQuestions);
// router.put('/exam', updateExamForModule);
// router.delete('/exam', deleteExam);

// router.post('/mct-holders',updateMCTHolders);

module.exports = router;
