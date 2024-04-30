const userService = require('../dbService/user.service');
const response = require('../helpers/response.helper');
module.exports.validateCourseWithUser = async (req, res, next) => {
  const {user} = req;
  const {courseId} = req.body;
  const isUserHaveCourse = await userService.userCourse(courseId, user.id);
  if (isUserHaveCourse) next();
  else return response.helper(res, false, 'USER_DONT_HAVE_COURSE', {}, 200);
};
