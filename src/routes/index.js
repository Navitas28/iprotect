const express = require('express');
const multer = require('multer');
const mime = require('mime-types');
const {fromString: uuid} = require('uuidv4');
const Common = require('@ethereumjs/common');
const ethereumTransaction = require('@ethereumjs/tx');
const log = require('ololog').configure({time: true});
const axios = require('axios');
const abiDecoder = require('abi-decoder');

const config = require('../../config');
const instance = require('../../utils/ethFactory');
const web3 = require('../../utils/web3');
const Certificate = require('../models/certificate');
const File = require('../models/file');

const router = express.Router();
const {FeeMarketEIP1559Transaction} = ethereumTransaction;
const {Chain, Hardfork} = Common;
const CommonDefault = Common.default;

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads');
	},
	filename: (req, file, cb) => {
		const nameWithoutExtension = file.originalname.split('.')[0];
		const name = nameWithoutExtension.toLowerCase().split(' ').join('-');
		const ext = mime.extension(file.mimetype);
		cb(null, name + '-' + Date.now() + '.' + ext);
	},
});

const MAX_GWEI = '200';

router.post('/certificate/new', async (req, res) => {
	const uuidHash = uuid(req.body.hash);
	const existingCert = await Certificate.findOne({uuid: uuidHash});
	// const existingIpInBlockchain = await instance.methods.getByUUID(uuidHash).call();
	if (existingCert) {
		res.status(400).json({
			status: false,
			message: 'This document already exists in the blockchain. Please try new one',
		});
		return;
	}
	const txInitiatedTimestamp = new Date();
	const certificate = new Certificate({
		uuid: uuidHash,
		txInitiatedTimestamp: txInitiatedTimestamp,
	});
	// await certificate.save();
	const data = instance.methods
		.issueCertificate(uuidHash, certificate._id.toString(), req.body.hash)
		.encodeABI();

	const privateKey = Buffer.from(config.walletPrivateKey, 'hex');
	let estimateGas = await web3.eth.estimateGas({
		to: config.contractAddress,
		from: config.walletAddress,
		data,
	});

	log(`estimateGas: ${estimateGas}`);
	let gasPrice = web3.utils.toHex(web3.utils.toWei(MAX_GWEI, 'gwei'));
	log(`gasPrice: ${gasPrice}`);
	let nonce = await web3.eth.getTransactionCount(config.walletAddress);
	log(`nonce: ${nonce}`);

	const rawTx = {
		from: config.walletAddress,
		to: config.contractAddress,
		gasLimit: web3.utils.toHex(estimateGas),
		nonce: nonce,
		maxPriorityFeePerGas: gasPrice,
		maxFeePerGas: gasPrice,
		data,
	};
	const common = new CommonDefault({
		chain: Chain.Goerli,
		hardfork: Hardfork.London,
	});

	const ethTx = FeeMarketEIP1559Transaction.fromTxData(rawTx, {common});

	const serializedTx = ethTx.sign(privateKey).serialize().toString('hex');

	web3.eth
		.sendSignedTransaction(`0x${serializedTx.toString('hex')}`)
		.once('transactionHash', async (hash) => {
			log(`transactionHash: ${hash}`);
			await Certificate.findByIdAndUpdate(certificate._id, {
				txHash: hash,
			});
			return res.json({
				status: true,
				msg: 'Successfully submitted. Please wait until it gets mined.',
				data: {
					txHash: hash,
					uuid: uuidHash,
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
		})
		.catch((error) => {
			log(error.message);
			return res.json({
				status: false,
				msg: error.message,
			});
		});
});

router.get('/certificate/:uuidHash', async (req, res) => {
	try {
		const existingCert = await Certificate.findOne({
			uuid: req.params.uuidHash,
		});
		if (!existingCert) {
			res.status(400).json({
				status: false,
				message: 'No Such certificate present, please enter valid uuid',
			});
		}
		if (existingCert.txWrittenInBlockTimestamp) {
			res.status(200).json(existingCert);
		}
		const transactionDetails = await web3.eth.getTransaction(existingCert.txHash);
		const blockDetails = await web3.eth.getBlock(transactionDetails.blockNumber);
		const updateCertificate = await Certificate.findOneAndUpdate(
			{uuid: req.params.uuidHash},
			{txWrittenInBlockTimestamp: new Date(blockDetails.timestamp * 1000)},
			{new: true},
		);
		res.status(200).json(updateCertificate);
	} catch (err) {
		console.log(err.message);
	}
});

router.get('/certificates/all', async (req, res) => {
	try {
		const certificates = await Certificate.find({});
		res.json(certificates);
	} catch (err) {
		return res.json({
			status: false,
			msg: err.message,
		});
	}
});

router.get('/internal/certificate/:uuidHash', async (req, res) => {
	const uuidHash = req.params.uuidHash;
	instance.methods.getByUUID(uuidHash).call((error, result) => {
		if (error) {
			console.log(error);
			res.json({
				status: false,
				msg: error.message,
			});
		} else {
			res.json({
				status: true,
				data: result,
			});
		}
	});
});

router.get('/internal/transaction/list', async (req, res) => {
	try {
		const apiUrl =
			'https://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=' +
			config.walletAddress +
			'&startblock=0&endblock=99999999&sort=asc&apikey=' +
			config.etherscanToken;
		let response = await axios.get(apiUrl);
		if (response.data.status == '0') {
			res.status(402).json(response.data);
		}
		let output = [];
		response.data.result.forEach(function (item) {
			//console.log(item.to.toUpperCase() + ' ' + process.env.CONTRACT_ADDRESS.toUpperCase());
			if (item.to.toUpperCase() == config.contractAddress.toUpperCase()) {
				let row = [];

				let decoded = abiDecoder.decodeMethod(item.input);
				//console.log(decoded.params[1].value);
				row.push(decoded.params[1].value);
				row.push(decoded.params[2].value);
				row.push(new Date(item.timeStamp * 1000));
				row.push(item.hash);
				row.push('verify');

				output.push(row);
			}
		});
		res.json({data: output});
	} catch (err) {
		console.log(err.message);
	}
});

router.post('/upload', multer({storage: storage}).single('file'), async (req, res) => {
	const file = new File({
		fileName: req.file.filename,
		originalName: req.file.originalname,
		size: req.file.size,
	});
	await file.save();
	res.json({message: 'Successfully uploaded files', fileName: file.fileName});
});

router.get('/uploads', async (req, res) => {
	const uploads = await File.find();
	res.status(200).json(uploads);
});

module.exports = router;
