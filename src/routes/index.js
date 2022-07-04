const express = require('express');
const {v4: uuidv4} = require('uuid');
const Common = require('@ethereumjs/common');
const ethereumTransaction = require('@ethereumjs/tx');
const log = require('ololog').configure({time: true});

const config = require('../../config');
const instance = require('../../utils/ethFactory');
const web3 = require('../../utils/web3');

const router = express.Router();
const {FeeMarketEIP1559Transaction} = ethereumTransaction;
const {Chain, Hardfork} = Common;
const CommonDefault = Common.default;

const MAX_GAS = 5000000;
const MAX_GWEI = '20';

router.post('/certificate', async (req, res) => {
	const uuidHash = uuidv4();
	const data = instance.methods
		.issueCertificate(uuidHash, req.body.docId, req.body.hash)
		.encodeABI();

	const privateKey = Buffer.from(config.walletPrivateKey, 'hex');
	let estimateGas = await web3.eth.estimateGas({
		to: config.walletAddress,
		data,
	});

	log(`estimateGas: ${estimateGas}`);
	let nonce = await web3.eth.getTransactionCount(config.walletAddress);

	log(`nonce: ${nonce}`);

	const rawTx = {
		nonce: nonce,
		from: config.walletAddress,
		to: config.contractAddress,
		gasPrice: web3.utils.toHex(web3.utils.toWei(MAX_GWEI, 'gwei')),
		gas: MAX_GAS,
		data,
	};
	const common = new CommonDefault({chain: Chain.Rinkeby, hardfork: Hardfork.London});

	const ethTx = FeeMarketEIP1559Transaction.fromTxData(rawTx, {common});

	const serializedTx = ethTx.sign(privateKey).serialize().toString('hex');

	web3.eth
		.sendSignedTransaction(`0x${serializedTx.toString('hex')}`)
		.once('transactionHash', (hash) => {
			log(`transactionHash: ${hash}`);
			return res.json({
				status: true,
				msg: 'Successfully submitted. Please wait until it gets mined.',
				data: {
					tx: hash,
					uuid: req.body.uuid,
				},
			});
		})
		.once('receipt', (receipt) => {
			log(`receipt is ready : ${receipt.transactionHash}`);
		})
		.on('error', (error) => {
			log('err:' + error.message);
		})
		.then((receipt) => {
			// Will be fired once the receipt is mined
			log(`${receipt.transactionHash} is mined`);
			log(
				`transactionHash: ${receipt.transactionHash} \nblockHash:  ${receipt.blockHash} \nstatus  : ${receipt.status} , gasUsed  : ${receipt.gasUsed}, blockNumber: ${receipt.blockNumber}, `,
			);
			return res.status(200).json({abc: '1'});
		})
		.catch((error) => {
			log(error.message);
			return res.json({
				status: false,
				msg: error.message,
			});
		});
});

module.exports = router;
