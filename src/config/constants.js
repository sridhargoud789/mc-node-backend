module.exports = {
	responseStatus: {
		BAD_REQUEST: 400,
		SUCCESS: 200,
		INTERNAL_SERVER_ERROR: 500,
		UN_AUTHORIZED: 401,
		FORBIDDEN: 403,
		NOT_FOUND: 404,
	},
	models: {},
	FILE_UPLOAD_DIRECTORY: {
		FORUMS: 'forums',
	},
	IMAGE_EXTENSION_ALLOWED: ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'],
	DEFAULT_LOG_DIR: 'logs',
	LOG_TYPE: [
		'error',
		'webhook',
		'cron',
		'info',
		'coinaseWebhook',
		'stripeWehbook',
		'coinbaseCommerceChangeLog',
		'rewardPointChangeLog',
		'rewardCron',
		'checkoutData',
		'quickbook',
	],
	CONSTANT_ROUTERS: {
		PUBLIC: '/public/api',
		API: '/api',
		API_USER: '/api/user',
		API_USERS: '/api/users',
		TAGS: '/api/tags',
		ARTICLES: '/api/articles',
		CRYPTOCURRENCIES: '/api/cryptocurrencies',
		INSTRUCTOR: '/api/instructor',
		ADMIN: '/api/admin',
		ARTICLE: '/api/article',
		INTUIT: '/api/intuit',
	},
}
