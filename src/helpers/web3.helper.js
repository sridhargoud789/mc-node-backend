const Web3 = require('web3');
const config = require('../config/config');
const sigUtil = require('eth-sig-util');
const {ethers} = require('ethers');

module.exports.validateUserToWallet = async (
    walletAddress,
    signature,
    chainId,
    language
) => {
  let message =  `MundoCrypto solicita acceso con tu cuenta ${walletAddress} para verificar tu identidad`;
  if(language == 'en') {
    message =   `Mundo crypto wants to sign in with your account ${walletAddress} to verify your identity`
  }
  const signerAddr = await ethers.utils.verifyMessage(message, signature);
  if (signerAddr !== walletAddress) {
    return false;
  }
  return true;
};


module.exports.getTransactionHashData = async (transactionHash) => {
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(config.WEB3_PROVIDER))
    const transactionData = await web3.eth.getTransactionReceipt(transactionHash);
    return transactionData;  
  } catch (err) {
    return null;
  }
}