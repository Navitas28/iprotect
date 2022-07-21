const mongoose = require('mongoose');

const app = require('./app');
const config = require('./config');

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
	app.listen(config.port, () => {
		console.log('App Started');
	});
};

start();
