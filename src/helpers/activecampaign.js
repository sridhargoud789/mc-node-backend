const axios = require('axios')
const config = require('../config/config')
const logger = require('../config/logger')

const optionsConfig = {
	headers: {
		accept: 'application/json',
		'content-type': 'application/json',
		'Api-Token': config.ACTIVE_CAMPAGIN,
	},
}
/**
 * This method is uesd to create contect over active campagine
 * calling this method from registration api and linking to email api
 * @param {*} userInfo
 * @returns
 */
exports.createContact = async (userInfo) => {
	try {
		const options = {
			...optionsConfig,
		}
		options.method = 'POST'
		options.url = `${config.ACTIVE_CAMPAGIN_URL}/api/3/contacts`
		options.data = userInfo

		return await axios.request(options)
	} catch (err) {
		logger.error(`error in active campagine create contact ${err}`)
		return {}
	}
}

/**
 * This method is used to add contact to specific list
 * @param {*} contactId
 * @param {*} listId
 * @returns
 */
exports.addContactToList = async (
	contactId,
	listId = config.ACTIVE_CAMPAGIN_LIST_FOR_USER
) => {
	try {
		const options = {
			...optionsConfig,
		}

		options.method = 'POST'
		options.url = `${config.ACTIVE_CAMPAGIN_URL}/api/3/contactLists`
		contactList = {
			list: listId,
			contact: contactId,
			status: 1,
		}
		options.data = {
			contactList,
		}
		return await axios.request(options)
	} catch (err) {
		logger.error(`error in active campagine add contact to list ${err}`)
		return {}
	}
}
/**
 * This method is used to get contect details from active campagine
 * @param {*} email
 * @returns
 */
exports.contectFetchByEmail = async (email) => {
	try {
		const options = {
			...optionsConfig,
		}
		options.method = 'GET'
		options.url = `${config.ACTIVE_CAMPAGIN_URL}/api/3/contacts?filters[email]=${email}`
		return await axios.request(options)
	} catch (err) {
		logger.error(`error in active campagine fetching contact ${err}`)
		return null
	}
}

/**
 * This method is used to add tag to specific contact
 * @param {*} contactId
 * @param {*} tagId
 * @returns
 */
exports.addTagsToContact = async (contactId, tagId) => {
	try {
		const options = {
			...optionsConfig,
		}
		options.method = 'POST'
		options.url = `${config.ACTIVE_CAMPAGIN_URL}/api/3/contactTags`
		contactTag = {
			contact: contactId,
			tag: tagId,
		}
		options.data = {
			contactTag,
		}
		return await axios.request(options)
	} catch (err) {
		logger.error(`error in active campagine add tags to contact ${err}`)
		return {}
	}
}

exports.getDealByPhoneNo = async (phoneno, group = 67) => {
	try {
		const options = {
			...optionsConfig,
		}
		options.method = 'GET'
		options.url = `${config.ACTIVE_CAMPAGIN_URL}/api/3/deals?filters[search]=${phoneno}&filters[group]=${group}`
		return await axios.request(options)
	} catch (err) {
		logger.error(`error in active campagine deal by phone no ${err}`)
		return null
	}
}

exports.updateActiveCampaignDeal = async (data, deal_id) => {
	try {
		const options = {
			...optionsConfig,
		}
		options.method = 'PUT'
		options.url = `${config.ACTIVE_CAMPAGIN_URL}/api/3/deals/${deal_id}`
		options.data = data

		return await axios.request(options)
	} catch (err) {
		logger.error(`error in active campagine update deal ${err}`)
		return {}
	}
}
exports.createActiveCampaignDeal = async (data) => {
	try {
		const options = {
			...optionsConfig,
		}
		options.method = 'POST'
		options.url = `${config.ACTIVE_CAMPAGIN_URL}/api/3/deals`
		options.data = data
		logger.activeCampaignLogger(
			`createActiveCampaignDeal data -- ${JSON.stringify(data)}`
		)
		return await axios.request(options)
	} catch (err) {
		logger.error(
			`error in active campagine create deal ${err} -- ${JSON.stringify(
				data
			)}`
		)
		return {}
	}
}
exports.addContactToAutomation = async (data) => {
	try {
		const options = {
			...optionsConfig,
		}
		options.method = 'POST'
		options.url = `${config.ACTIVE_CAMPAGIN_URL}/api/3/contactAutomations`
		options.data = data

		return await axios.request(options)
	} catch (err) {
		logger.error(
			`error in active campagine create deal ${err} -- ${JSON.stringify(
				data
			)}`
		)
		return {}
	}
}

exports.updateACContactTag = async (tag_id, contact_id) => {
	try {
		const options = {
			...optionsConfig,
		}
		options.method = 'POST'
		options.url = `${config.ACTIVE_CAMPAGIN_URL}/api/3/contactTags`
		options.data = {
			contactTag: {
				contact: contact_id,
				tag: tag_id,
			},
		}
		return await axios.request(options)
	} catch (err) {
		logger.error(`error in active campagine update deal ${err}`)
		return {}
	}
}
