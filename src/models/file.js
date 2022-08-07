const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fileSchema = new Schema({
	fileName: {type: String, required: true},
	originalName: {type: String, required: true},
	size: {type: Number},
});

fileSchema.statics.build = (attrs) => {
	return new File(attrs);
};
module.exports = mongoose.model('File', fileSchema);
