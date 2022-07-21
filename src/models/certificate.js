const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
const {
	Types: {Long},
} = mongoose;

const Schema = mongoose.Schema;

const certificateSchema = new Schema({
	uuid: {type: String, required: true},
	txInitiatedTimestamp: {type: Date},
	txWrittenInBlockTimestamp: {type: Date, default: null},
	txHash: {type: String},
});

certificateSchema.statics.build = (attrs) => {
	return new Certificate(attrs);
};
module.exports = mongoose.model('Certificate', certificateSchema);
