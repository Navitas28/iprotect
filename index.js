const app = require('./app');
const config = require('./config');

const start = async () => {
	app.listen(config.port, () => {
		console.log('App Started');
	});
};

start();
