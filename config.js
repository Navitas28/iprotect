const dotenv = require('dotenv');

const envFound = dotenv.config();

if (envFound.error) {
	throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

const config = {
	port: process.env.PORT,
	walletAddress: process.env.WALLET_ADDRESS,
	walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
	contractAddress: process.env.CONTRACT_ADDRESS,
	infuraToken: process.env.INFURA_ACCESS_TOKEN,
	networkAddress: process.env.NETWORK_ADDRESS,
	etherscanToken: process.env.ETHERSCAN_TOKEN,
	mnemonic: process.env.MNEMONIC,
	databaseURI: `mongodb+srv://${process.env.MONGOOSE_URI_USERNAME}:${process.env.MONGOOSE_URI_PASSWORD}@${process.env.MONGO_URI}/${process.env.MONGOOSE_URI_DB}?retryWrites=true`,
};

module.exports = config;
