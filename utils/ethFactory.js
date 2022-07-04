const abiDecoder = require('abi-decoder');
const config = require('../config');

const web3 = require('./web3');

const iprotectABI = require('../src/abis/iprotect');

// const contract = JSON.parse(fs.readFileSync('./build/contracts/IProtect.json', 'utf8'));

// const iprotectABI = JSON.stringify(contract.abi);

abiDecoder.addABI(iprotectABI);
const instance = new web3.eth.Contract(iprotectABI, config.contractAddress);

module.exports = instance;
