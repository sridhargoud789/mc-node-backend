const { Op } = require('sequelize')
const sequelize = require('sequelize')
const dbObj = require('../../models')
const userModel = dbObj.users
const courseModulesModel = dbObj.course_modules;
const courseModel = dbObj.courses;
const courseModuleMultiLanguageModel = dbObj.course_modules_multi_languages;

exports.find = async (moduleId) => {
    try {
        const data = await courseModulesModel.findOne({
            where: {
                id: moduleId
            },
            attributes: ['id', 'name', 'description', 'duration', 'module_index',
            'course_id', 'created_at', 'percentage'],
        });
        return {isSuccess: true, data};
    } catch (err) {
        return {isSuccess: false, err};
    }
}

exports.courseDetailsByModule = async (moduleId) => {
    try {
        const data = await courseModulesModel.findOne({
            where: {
                id: moduleId
            },
            attributes: ['id', 'name', 'description', 'duration', 'module_index',
            'course_id', 'created_at', 'percentage'],
            include: [
                {
                    model: courseModel,
                    as: 'courses'
                }
            ]
        });
        return {isSuccess: true, data};
    } catch (err) {
        return {isSuccess: false, err};
    }
}

exports.multiLanguageModuleDetails = async (moduleId, language) => {
    try {
        const data = await courseModulesModel.findAll({
            where: {
                module_id: moduleId,
                ...(language && {
                    language_code : language
                })
            }
        });
        return {isSuccess: true, data};
    } catch (err) {
        return {isSuccess: false, err};
    }
}

exports.updateModule = async (moduleId, updateModuleData) => {
    try {
        const data = await courseModulesModel.update(updateModuleData,{
            where: {
                id: moduleId
            }
        })
        return {isSuccess: true, data};
    } catch (err) {
        return {isSuccess: false, err};
    }
}

exports.updateMultiLanguageModule = async (moduleId, language, updateModuleData) => {
    try {
        const data = await courseModuleMultiLanguageModel.update(updateModuleData,{
            where: {
                module_id: moduleId,
                language_code: language,
            }
        })
        return {isSuccess: true, data};
    } catch (err) {
        return {isSuccess: false, err};
    }
}