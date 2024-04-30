const { Op } = require('sequelize')
const { sequelize } = require('../../models/index')
const moment = require('moment')
const dbObj = require('../../models/index')
const logger = require('../config/logger')
const examQuestionModel = dbObj.exam_questions
const userQueAnswerModel = dbObj.user_que_answers
const historyUserExamModel = dbObj.history_user_exams
const courseExamModel = dbObj.course_exams
const userModel = dbObj.users
const userWalletModel = dbObj.users_wallets
const examQuestionMappingModel = dbObj.exam_questions_mappings
const userExamReportModel = dbObj.user_exam_reports;
const examQuestionMultiLanguageModel = dbObj.exam_questions_multi_languages;

module.exports.questionDetails = async (questionId) => {
	const data = await examQuestionModel.findOne({
		where: {
			id: questionId,
		},
		attributes: ['id', 'question', 'correct_answer', 'option1', 'option2', 'option3', 'option4'],
	})
	return data
}

module.exports.addUserAnsToDb = async (userAnsData) => {
	const data = await userQueAnswerModel.create(userAnsData)
	return data
}

module.exports.startExam = async (userId, examId, exam_reward, reward_with, reward_in) => {
	const d = {
		user_id: userId,
		exam_id: examId,
		start_time: moment(),
		exam_reward,
		reward_with,
		reward_in,
	}
	const data = await historyUserExamModel.create(d)
	return data
}

module.exports.examAlreadyStarted = async (userId, examId) => {
	const data = await historyUserExamModel.findOne({
		where: {
			user_id: userId,
			exam_id: examId,
		},
	})
	return data
}

module.exports.checkIsAnswered = async (questionId, userId, examId) => {
	const data = await userQueAnswerModel.findOne({
		where: {
			user_id: userId,
			exam_id: examId,
			question_id: questionId,
		},
		attributes: ['id'],
	})
	return data
}

module.exports.isExamStarted = async (examId, userId) => {
	const data = await historyUserExamModel.findOne({
		where: {
			user_id: userId,
			exam_id: examId,
			completed_time: null,
		},
		attributes: ['id', 'user_id', 'exam_id'],
	})
	return data
}

module.exports.courseDataByExam = async (examId) => {
	const data = await courseExamModel.findOne({
		where: {
			id: examId,
		},
		attributes: ['id', 'name', 'instruction', 'course_id', 'module_id'],
	})
	return data
}

module.exports.endExam = async (examId, userId) => {
	const com = moment().format('YYYY-MM-DD HH:MM:SS')
	const data = await historyUserExamModel.update(
		{
			completed_time: new Date(),
		},
		{
			where: {
				user_id: userId,
				exam_id: examId,
			},
		}
	)
	return data
}

module.exports.userExamData = async (examId, userId) => {
	const data = await historyUserExamModel.findOne({
		where: {
			user_id: userId,
			exam_id: examId,
		},
		attributes: [
			'id',
			'user_id',
			'exam_id',
			'exam_reward',
			'reword_points',
			'completed_time',
			'start_time',
			'is_point_collected',
			'is_passed',
			'is_request_to_collect',
			'percentage',
		],
	})
	return data
}

module.exports.questionData = async (examId, userId) => {
	const data = await userQueAnswerModel.findAll({
		where: {
			user_id: userId,
			exam_id: examId,
		},
		attributes: [
			'id',
			'question',
			'created_at',
			'correct_answer',
			'user_answer',
			'is_correct',
		],
	})
	return data
}

module.exports.updateUserExamData = async (examId, userId, updateExamData) => {
	const data = await historyUserExamModel.update(updateExamData, {
		where: {
			user_id: userId,
			exam_id: examId,
		},
	})
	return data
}

module.exports.userQuestionAnsResult = async (examId, userId) => {
	const data = await userQueAnswerModel.findOne({
		where: {
			exam_id: examId,
			user_id: userId,
		},
		attributes: [
			'id',
			[
				sequelize.literal(
					'(SELECT count(`id`) FROM `user_que_answers` WHERE `user_que_answers`.`is_correct` = 1 and `user_que_answers`.`exam_id` = ' +
						examId +
						' and `user_que_answers`.`user_id` =' +
						userId +
						')'
				),
				'correct_answers',
			],
			[
				sequelize.literal(
					'(SELECT count(`id`) FROM `user_que_answers` WHERE `user_que_answers`.`is_correct` = 0 and `user_que_answers`.`exam_id` = ' +
						examId +
						' and `user_que_answers`.`user_id` =' +
						userId +
						')'
				),
				'wrong_answers',
			],
		],
	})
	return data
}

module.exports.getUserRewordPointsToTransfer = async () => {
	try {
		const data = await historyUserExamModel.findAll({
			where: {
				is_point_collected: 0,
				is_passed: 1,
				is_request_to_collect: 1,
				reward_with: 'mct',
				reward_in: 'mct',
			},
			attributes: [
				'user_id',
				['id','exam_id'],
				['reword_points', 'total_reward']
				// [
				// 	sequelize.fn('SUM', sequelize.col('reword_points')),
				// 	'total_reward',
				// ],
			],
			include: [
				{
					model: userModel,
					attributes: ['id'],
					as: 'user',
					include: [
						{
							model: userWalletModel,
							attributes: ['wallet_address'],
							as: 'userWallets',
							where: {
								is_default: 1,
							},
							required: true
						},
					],
				},
			],
			// group: ['user_id'],
		}, )
		return data;
	} catch (err) {
		logger.error(`${err}`);
	}
}

module.exports.updateUserPointTransfered = async (userIdList) => {
	const data = await historyUserExamModel.update(
		{
			is_point_collected: 1,
			is_request_to_collect: 0,
		},
		{
			where: {
				is_point_collected: 0,
				is_request_to_collect: 1,
				is_passed: 1,
				user_id: {
					[Op.in]: userIdList,
				},
			},
		}
	)
	return data
}

module.exports.clainReward = async (userId) => {
	const data = await historyUserExamModel.update(
		{
			is_request_to_collect: 1,
			request_time_to_collect: new Date()
		},
		{
			where: {
				user_id: userId,
				is_point_collected: 0,
				is_passed: 1,
				is_request_to_collect: 0,
			},
		}
	)
	return data
}

module.exports.saveUpdateSuffle = async (
	exam_id,
	question_id,
	shuffle_index
) => {
	const suffleData = {
		exam_id,
		question_id,
		shuffle_index,
	}
	return await examQuestionMappingModel
		.findOne({
			where: {
				exam_id,
				question_id,
			},
		})
		.then(function (obj) {
			if (obj) return obj.update(suffleData)
			return examQuestionMappingModel.create(suffleData)
		})
}

module.exports.getQuestion = async (exam_id, shuffle_index,language) => {
	const data = await examQuestionMappingModel.findAll({
		where: {
			exam_id,
			shuffle_index,
		},
		include: [
			{
				model: examQuestionModel,
				attributes: [
					'id',
					'question',
					'option1',
					'option2',
					'option3',
					'option4',
					'created_at',
					'updated_at',
				],
				order: [['created_at', 'ASC']],
				as: 'questions',
				include: [
					{
						model: examQuestionMultiLanguageModel,
						...(language && {
							where: {
							  language_code: language
							}
						  }),
						as: 'questionData'
					}
				]

			},
		],
		order: [[[sequelize.literal('rand()')]]],
		limit: 1,
	});
	if(language) {
		data[0].questions.question = data[0].questions?.questionData.question;
		data[0].questions.option1 = data[0].questions?.questionData.option1;
		data[0].questions.option2 = data[0].questions?.questionData.option2;
		data[0].questions.option3 = data[0].questions?.questionData.option3;
		data[0].questions.option4 = data[0].questions?.questionData.option4;
	}
	return data
}

module.exports.saveExamReportData = async (examReportData) => {
	const data = await userExamReportModel.create(examReportData);
	return data;
}

module.exports.checkIsShuffleQuestionAnswered = async (questionId, examId, userId) => {
	const data = await examQuestionMappingModel.findOne({
		where: {
			question_id: questionId
		}
	});
	if(data) {
		const shuffleQuestions = await examQuestionMappingModel.findAll({
			where: {
				shuffle_index: data.shuffle_index,
				exam_id: examId
			}
		});
		const queArr = [];
		shuffleQuestions.forEach(que => {
			queArr.push(que.question_id);
		})
		const answeredQuestionWithShuffle = await userQueAnswerModel.findOne({
			where: {
				question_id: {
					[Op.in] : queArr
				}, 
				user_id: userId
			}
		});
		if(answeredQuestionWithShuffle) {
			return true;
		}
	}
	return false;
}

module.exports.examListByCourse = async (courseId) => {
	const data = await courseExamModel.findAll({
		where: {
			course_id: courseId
		}
	});
	return data;
}

module.exports.checkExamCompletedOrNot = async (moduleExamObj, moduleCompletedArr, completedExam) => {
	let foundExam;
	moduleCompletedArr.forEach(moduleId => {
		if(!foundExam) {
			const examId = moduleExamObj[`${moduleId}`];
			let isAlreadyCompleted = false;
			if(completedExam == null) {
				if(examId) {
					foundExam = examId
				}
			} else {
				completedExam.forEach(eachExam => {
					if(eachExam == examId) {
						isAlreadyCompleted = true
					}
				})
				if(!isAlreadyCompleted) {
					foundExam = examId
				}
			}
		} 
	}) 
	return foundExam;
}

module.exports.getExamList = async (courseId) => {
	return await courseExamModel.findAll({
		where: {
			course_id: courseId
		},
		attributes: ['id']
	})
}

module.exports.getExamDetailsByList = async (examIdList, user_id) => {
	return await historyUserExamModel.findAll({
		where: {
			exam_id: {
				[Op.in]: examIdList
			},
			user_id,
		}
	});
}