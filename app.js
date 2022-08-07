const express = require('express');
const helmet = require('helmet');

const router = require('./src/routes/');
const path = require('path');
const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(
	helmet({
		frameguard: {
			action: 'deny',
		},
		hidePoweredBy: true,
		xssFilter: true,
		noSniff: true,
		ieNoOpen: true,
		hsts: {
			maxAge: 7776000,
			force: true,
		},
	}),
);
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
	next();
});
app.use('/', express.static(path.join(__dirname, 'client/build')));

app.use('/api', router);

module.exports = app;
