const mongoose = require('mongoose');
const http = require('http');
const https = require('https');
const app = require('./app');
const config = require('./config');
const fs = require('fs');

let credentials;
if (process.env.NODE_ENV === 'production') {
	const privateKey = fs.readFileSync('../../private.key', 'utf8');
	const certificate = fs.readFileSync('../../certificate.crt', 'utf8');
	credentials = {key: privateKey, cert: certificate};
}

const start = async () => {
	try {
		await mongoose.connect(config.databaseURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: true,
		});
		console.log('DB Connected');
	} catch (err) {
		console.error(err);
	}

	const httpServer = http.createServer(app);
	const httpsServer = https.createServer(credentials, app);
	if (process.env.NODE_ENV === 'production') {
		httpsServer.listen(config.port, () => {
			console.log('App Started in production on port', config.port);
		});
	} else {
		httpServer.listen(config.devPort, () => {
			console.log('App Started in development on port', config.devPort);
		});
	}
};

start();
