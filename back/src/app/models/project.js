const mongoose = require('../../database');

const ProjectSchema = new mongoose.Schema({
	automobile: {
		type: String,
		require: true
	},
	mark: {
		type: String,
		require: true
	},
	model: {
		type: String,
		require: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		require: true
	},
	tasks: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task'
	}],
	createdAt: {
		type: Date,
		default: Date.now 
	}
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;