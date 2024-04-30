// NFT contract: 0xDa69C7EE423143a0A7566457c5b8E9D5F0871B6B
// Network: Polygon
const Web3 = require('web3')
const { Transaction } = require('@ethereumjs/tx')
const { default: Common, CustomChain } = require('@ethereumjs/common')
const {
	OWNER_PRIVATE_KEY,
	ALCHEMY_POLYGON,
	POLYGONSCAN_KEY,
} = require('../config/config.js')
const logger = require('../config/logger.js')
const web3 = new Web3(new Web3.providers.HttpProvider(ALCHEMY_POLYGON))
const axios = require('axios');
const polygonMainnetCommon = Common.custom(CustomChain.PolygonMainnet)

// @todo create seperate ABI folder and env based contract address
const nftContractInstance = new web3.eth.Contract(
	[
		{
			inputs: [],
			stateMutability: 'nonpayable',
			type: 'constructor',
		},
		{
			inputs: [],
			name: 'OnlyMintTransfersAllowed',
			type: 'error',
		},
		{
			inputs: [],
			name: 'ParamslengthMismatch',
			type: 'error',
		},
		{
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: 'address',
					name: 'owner',
					type: 'address',
				},
				{
					indexed: true,
					internalType: 'address',
					name: 'approved',
					type: 'address',
				},
				{
					indexed: true,
					internalType: 'uint256',
					name: 'tokenId',
					type: 'uint256',
				},
			],
			name: 'Approval',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: 'address',
					name: 'owner',
					type: 'address',
				},
				{
					indexed: true,
					internalType: 'address',
					name: 'operator',
					type: 'address',
				},
				{
					indexed: false,
					internalType: 'bool',
					name: 'approved',
					type: 'bool',
				},
			],
			name: 'ApprovalForAll',
			type: 'event',
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
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: 'address',
					name: 'from',
					type: 'address',
				},
				{
					indexed: true,
					internalType: 'address',
					name: 'to',
					type: 'address',
				},
				{
					indexed: true,
					internalType: 'uint256',
					name: 'tokenId',
					type: 'uint256',
				},
			],
			name: 'Transfer',
			type: 'event',
		},
		{
			inputs: [
				{
					internalType: 'address',
					name: 'to',
					type: 'address',
				},
				{
					internalType: 'uint256',
					name: 'tokenId',
					type: 'uint256',
				},
			],
			name: 'approve',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'address',
					name: 'owner',
					type: 'address',
				},
			],
			name: 'balanceOf',
			outputs: [
				{
					internalType: 'uint256',
					name: '',
					type: 'uint256',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'uint256',
					name: 'tokenId',
					type: 'uint256',
				},
			],
			name: 'getApproved',
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
		{
			inputs: [
				{
					internalType: 'address',
					name: 'owner',
					type: 'address',
				},
				{
					internalType: 'address',
					name: 'operator',
					type: 'address',
				},
			],
			name: 'isApprovedForAll',
			outputs: [
				{
					internalType: 'bool',
					name: '',
					type: 'bool',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'address[]',
					name: 'accounts',
					type: 'address[]',
				},
				{
					internalType: 'string[]',
					name: 'uris',
					type: 'string[]',
				},
			],
			name: 'mintMultipleCertificates',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'address',
					name: 'account',
					type: 'address',
				},
				{
					internalType: 'string',
					name: 'uri',
					type: 'string',
				},
			],
			name: 'mintSingleCertificate',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [],
			name: 'name',
			outputs: [
				{
					internalType: 'string',
					name: '',
					type: 'string',
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
		{
			inputs: [
				{
					internalType: 'uint256',
					name: 'tokenId',
					type: 'uint256',
				},
			],
			name: 'ownerOf',
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
					name: 'from',
					type: 'address',
				},
				{
					internalType: 'address',
					name: 'to',
					type: 'address',
				},
				{
					internalType: 'uint256',
					name: 'tokenId',
					type: 'uint256',
				},
			],
			name: 'safeTransferFrom',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'address',
					name: 'from',
					type: 'address',
				},
				{
					internalType: 'address',
					name: 'to',
					type: 'address',
				},
				{
					internalType: 'uint256',
					name: 'tokenId',
					type: 'uint256',
				},
				{
					internalType: 'bytes',
					name: 'data',
					type: 'bytes',
				},
			],
			name: 'safeTransferFrom',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'address',
					name: 'operator',
					type: 'address',
				},
				{
					internalType: 'bool',
					name: 'approved',
					type: 'bool',
				},
			],
			name: 'setApprovalForAll',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'bytes4',
					name: 'interfaceId',
					type: 'bytes4',
				},
			],
			name: 'supportsInterface',
			outputs: [
				{
					internalType: 'bool',
					name: '',
					type: 'bool',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [],
			name: 'symbol',
			outputs: [
				{
					internalType: 'string',
					name: '',
					type: 'string',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'uint256',
					name: 'tokenId',
					type: 'uint256',
				},
			],
			name: 'tokenURI',
			outputs: [
				{
					internalType: 'string',
					name: '',
					type: 'string',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'address',
					name: 'from',
					type: 'address',
				},
				{
					internalType: 'address',
					name: 'to',
					type: 'address',
				},
				{
					internalType: 'uint256',
					name: 'tokenId',
					type: 'uint256',
				},
			],
			name: 'transferFrom',
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
	],
	'0xDa69C7EE423143a0A7566457c5b8E9D5F0871B6B'
)

const mintNFT = async (addresses, uris) => {
	logger.info('NFT Mint start')

	// if (addresses.length != uris.length || addresses.length == 0) {
	// 	logger.info('Empty data or mismatch')
	// 	return
	// }

	const { address: fromAddress } =
		web3.eth.accounts.privateKeyToAccount(OWNER_PRIVATE_KEY)
	console.log('from ADdress', fromAddress);
	try {
		const fromAddressNonce = await web3.eth.getTransactionCount(
			fromAddress,
			'pending'
		)

		let functionToCall

		if (addresses.length > 1)
			functionToCall = nftContractInstance.methods
				.mintMultipleCertificates(addresses, uris)
				.encodeABI()
		else
			functionToCall = nftContractInstance.methods
				.mintSingleCertificate(...addresses, ...uris)
				.encodeABI()

		const gasInfo = await axios.get(
			`https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=${POLYGONSCAN_KEY}`
		)

		const txData = {
			nonce: web3.utils.toHex(fromAddressNonce),
			from: fromAddress,
			gasPrice: web3.utils.toHex(
				web3.utils.toWei(gasInfo.data.result.FastGasPrice, 'Gwei')
			),
			gasLimit: web3.utils.toHex('3000000'),
			to: nftContractInstance.options.address,
			value: '0x00',
			data: functionToCall,
		}
		console.log('txDAta', txData);
		const tx = Transaction.fromTxData(txData, {
			common: polygonMainnetCommon,
		})
		const privKey = Buffer.from(OWNER_PRIVATE_KEY, 'hex')
		const signedTx = tx.sign(privKey)
		const serializedTx = signedTx.serialize()

		const data = await web3.eth
			.sendSignedTransaction(`0x${serializedTx.toString('hex')}`)
			.on('receipt', console.log)

		return data
	} catch (error) {
		console.log('err', error);
		logger.error(error)
	}
	logger.info('NFT Mint End')
}

module.exports = {
	mintNFT,
}
