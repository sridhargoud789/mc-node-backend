const envConfig = require('dotenv')
envConfig.config()

module.exports = {
	PORT: process.env.PORT || 3000,
	ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
	NODE_ENV: process.env.NODE_ENV,
	DBUSER: process.env.DBUSER,
	DBPASS: process.env.DBPASS,
	DBNAME: process.env.DBNAME,
	DBHOST: process.env.DBHOST,
	DBDIALECT: process.env.DBDIALECT,
	DBCONSOLE: process.env.DBLOGGING,
	AUTH_TOKEN_EXPIRY: process.env.AUTH_TOKEN_EXPIRY,

	MS_PUBLIC_S3: process.env.AWS_MS_PUBLIC_S3,
	MS_TUTORIAL_BUCKET: process.env.AWS_MS_TUTORIAL_BUCKET_NAME,
	AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
	AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
	AWS_REGION: process.env.AWS_REGION,

	PAYPAL_MODE: process.env.PAYPAL_MODE,
	PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
	PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
	OWNER_PRIVATE_KEY: process.env.OWNER_PRIVATE_KEY,
	ALCHEMY_POLYGON: process.env.ALCHEMY_POLYGON,
	ALCHEMY_ETH: process.env.ALCHEMY_ETH,

	COINBASE_SECRET: process.env.COINBASE_SECRET,
	COINBASE_WEBHOOK: process.env.COINBASE_WEBHOOK,

	WEB3_PROVIDER: process.env.WEB3_PROVIDER,
	FRONT_DOMAIN: process.env.FRONT_DOMAIN,

	IS_LEARNING_PROCESS_STOP: process.env.IS_LEARNING_PROCESS_STOP,

	PINATA_API_Key: process.env.PINATA_API_Key,
	PINATA_API_Secret: process.env.PINATA_API_Secret,
	PINATA_API_JWT: process.env.PINATA_API_JWT,

	COINRANKING_KEYS: process.env.COINRANKING_KEYS,

	COINMARKETCAP_KEYS: process.env.COINMARKETCAP_KEYS,
	STRIPE_KEY: process.env.STRIPE_KEY,

	ACTIVE_CAMPAGIN: process.env.ACTIVE_CAMPAGIN,
	ACTIVE_CAMPAGIN_URL: process.env.ACTIVE_CAMPAGIN_URL,
	ACTIVE_CAMPAGIN_LIST_FOR_USER: process.env.ACTIVE_CAMPAGIN_LIST_FOR_USER,

	OWNER_WALLET_ADDRESS: process.env.OWNER_WALLET_ADDRESS,

	BOOKING_SEAT_TAG: 103,
	TALK_TO_EXPERT: 104,

	PACKAGE_LIST: 86,
	PACKAGE_ID: 87,

	COURSE_BLOCKCHAIN_LIST: 86,
	COURSE_BLOCKCHAIN_ID: 97,

	COURSE_CRYPTO_ATOZ_LIST: 86,
	COURSE_CRYPTO_ATOZ_ID: 95,

	COURSE_BLOCKCHAIN_EXPERT_LIST: 86,
	COURSE_BLOCKCHAIN_EXPERT_LIST: 96,

	COURSE_PROGRAM_SOLIDITY_LIST: 86,
	COURSE_PROGRAM_SOLIDITY_ID: 98,

	COURSE_JAVA_LIST: 86,
	COURSE_JAVA_ID: 93,

	COURSE_DEFI_LIST: 86,
	COURSE_DEFI_ID: 91,

	COURSE_TRADING_LIST: 86,
	COURSE_TRADING_ID: 90,

	COINMARKETCAP_CRON_TIME: process.env.COINMARKETCAP_CRON_TIME,

	ETHERSCAN_KEY: process.env.ETHERSCAN_KEY,

	POLYGONSCAN_KEY: process.env.POLYGONSCAN_KEY,

	REWARD_CRON_TIME: process.env.REWARD_CRON_TIME,
}
