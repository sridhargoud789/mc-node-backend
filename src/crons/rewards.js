// Airdrop contract: 0x49618391A3C7c5E655d28315fe6cd309E3125c81
// Token contract: 0x61ea51ae6ff1834e4b4929666a0532c20a5c72b2
// Network: Mainnet
const cron = require('node-cron')
const Web3 = require('web3')
const { Transaction } = require('@ethereumjs/tx')
const { default: Common } = require('@ethereumjs/common')
const {
	OWNER_PRIVATE_KEY,
	ALCHEMY_ETH,
	ETHERSCAN_KEY,
	REWARD_CRON_TIME,
} = require('../config/config.js')
const examService = require('../dbService/exam.services')
const logger = require('../config/logger.js')
const axios = require('axios')
const { BigNumber } = require('ethers')
const web3 = new Web3(new Web3.providers.HttpProvider(ALCHEMY_ETH))

const polygonMainnetCommon = Common.custom({
	chainId: 1,
})

// @todo create seperate ABI folder and env based contract address
const airdropContractInstance = new web3.eth.Contract(
	[
		{
			inputs: [
				{
					internalType: 'address[]',
					name: '_recipients',
					type: 'address[]',
				},
				{
					internalType: 'uint256[]',
					name: '_amounts',
					type: 'uint256[]',
				},
			],
			name: 'distributeRewards',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'contract IERC20',
					name: '_token',
					type: 'address',
				},
			],
			stateMutability: 'nonpayable',
			type: 'constructor',
		},
		{
			inputs: [],
			name: 'ParamslengthMismatch',
			type: 'error',
		},
		{
			inputs: [],
			name: 'renounceOwnership',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'address',
					name: 'newOwner',
					type: 'address',
				},
			],
			name: 'transferOwnership',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'address',
					name: 'beneficiary',
					type: 'address',
				},
			],
			name: 'withdrawTokens',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [],
			name: 'ZeroAddress',
			type: 'error',
		},
		{
			inputs: [
				{
					internalType: 'string',
					name: 'paramName',
					type: 'string',
				},
			],
			name: 'ZeroValuedParam',
			type: 'error',
		},
		{
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: 'address',
					name: 'previousOwner',
					type: 'address',
				},
				{
					indexed: true,
					internalType: 'address',
					name: 'newOwner',
					type: 'address',
				},
			],
			name: 'OwnershipTransferred',
			type: 'event',
		},
		{
			inputs: [],
			name: 'airdroppingToken',
			outputs: [
				{
					internalType: 'contract IERC20',
					name: '',
					type: 'address',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [],
			name: 'owner',
			outputs: [
				{
					internalType: 'address',
					name: '',
					type: 'address',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
	],
	'0x49618391A3C7c5E655d28315fe6cd309E3125c81'
)

cron.schedule(REWARD_CRON_TIME, async () => {
	logger.rewardCron('Reward Distribution Cron Started')
	const userRewordPoints = await examService.getUserRewordPointsToTransfer()
	const userIdList = []
	const addressList = []
	const rewardList = []
	try {
		for (let i = 0; i < userRewordPoints.length; i++) {
			const u = userRewordPoints[i].dataValues.user?.userWallets
			if (!u || !u.length || !u[0].wallet_address) {
				continue
			} else {
				addressList.push(u[0].wallet_address)
				rewardList.push(
					BigNumber.from(userRewordPoints[i].dataValues.total_reward).mul(BigNumber.from(10).pow(18))
				)
				userIdList.push(userRewordPoints[i].dataValues.user_id)
			}
		}
	} catch (err) {
		console.log(err)
		logger.rewardCron(`Error in Reward Cron calculation ${err}`)
	}

	console.log(userIdList, addressList, rewardList);

	if (false && addressList.length > 0) {
		const { address: fromAddress } =
			web3.eth.accounts.privateKeyToAccount(OWNER_PRIVATE_KEY)

		try {
			const fromAddressNonce = await web3.eth.getTransactionCount(
				fromAddress,
				'pending'
			)
			const gasInfo = await axios.get(
				`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_KEY}`
			)
			
			const txData = {
				nonce: web3.utils.toHex(fromAddressNonce),
				from: fromAddress,
				gasPrice: web3.utils.toHex(
					web3.utils.toWei(gasInfo.data.result.FastGasPrice, 'Gwei')
				),
				gasLimit: web3.utils.toHex('3000000'),
				to: airdropContractInstance.options.address,
				value: '0x00',
				data: airdropContractInstance.methods
					.distributeRewards(addressList, rewardList)
					.encodeABI(),
			}
			const tx = Transaction.fromTxData(txData, {
				common: polygonMainnetCommon,
			})
			const privKey = Buffer.from(OWNER_PRIVATE_KEY, 'hex')
			const signedTx = tx.sign(privKey)
			const serializedTx = signedTx.serialize()

			const data = await web3.eth
				.sendSignedTransaction(`0x${serializedTx.toString('hex')}`)
				.on('receipt', console.log)
			
			await examService.updateUserPointTransfered(userIdList)
		} catch (error) {
			console.log(error)
			logger.rewardCron(`Error in  Reward cron sent${error}`)
		}
	}
	logger.rewardCron('Reward Cron End')
})
