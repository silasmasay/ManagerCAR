const mongoose = require('../../database');
const bcryptjs = require('bcryptjs');
// @M4N4GER_C4R

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	email: {
		type: String,
		require: true,
		unique: true,
		lowercase: true
	},
	password: {
		type: String,
		require: true,
		select: false
	},
	projects: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Project'
	}],
	passwordResetToken: {
		type: String,
		select: false,
	},
	passwordResetExpires: {
		type: Date,
		select: false
	},
	createdAt: {
		type: Date,
		default: Date.now 
	}
});

UserSchema.pre('save', async function(next) {
	if (this.password) {
		const hash = await bcryptjs.hash(this.password, 10);

		this.password = hash;
	}

	next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;