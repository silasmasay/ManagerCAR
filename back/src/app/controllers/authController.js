const User = require('../models/user');
const authConfig = require('../../config/auth');
const mailer = require('../../modules/mailer');

const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const router = express.Router();

function generateToken(params = {}) {
	return jwt.sign(params, authConfig.secret, {
		expiresIn: 86400, // Um dia
	});
}

router.post('/register', async (req, res) => {
	const { email } = req.body;

	try {
		if (await User.findOne({ email })) return res.status(400).send({ error: 'Email já cadastrado.' });

		const user = await User.create(req.body);

		user.password = undefined;

		const token = generateToken({ id: user.id });
		
		return res.send({ user, token });
	} catch (err) {
		return res.status(400).send({ error: 'Falha no registro.' });
	}
});

router.post('/authenticate', async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email }).select('+password');

	if (!user) return res.status(400).send({ error: 'Usuário não encontrado!' });

	if (!await bcryptjs.compare(password, user.password)) return res.status(400).send({ error: 'Senha Inválida!' });

	user.password = undefined;

	const token = generateToken({ id: user.id });

	return res.send({ user, token });
});

router.post('/forgot_password', async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) return res.status(400).send({ error: 'Usuário não encontrado!' });

		const token = crypto.randomBytes(20).toString('hex');

		const now = new Date();

		now.setHours(now.getHours() + 1);

		await User.findByIdAndUpdate(user.id, {
			'$set': {
				passwordResetToken: token,
				passwordResetExpires: now
			}
		}, {
			new: true,
			useFindAndModify: false
		});

		mailer.sendMail({
			to: email,
			from: 'suport@managercar.com',
			template: 'auth/forgot_password',
			context: { token }
		}, (err) => {
			if (err) return res.status(400).send({ error: 'Não foi possível enviar o email para recuperação de senha.' });

			return res.send();
		});
	} catch (err) {
		res.status(400).send({ error: 'Ouve uma instabilidade no sistema, tente novamente.' });
	}
});

router.post('/reset_password', async (req, res) => {
	const { email, token, password } = req.body;

	try {
		const user = await User.findOne({ email })
			.select('+passwordResetToken passwordResetExpires');

		if (!user) return res.status(400).send({ error: 'Usuário não encontrado!' });

		if (token !== user.passwordResetToken) return res.status(400).send({ error: 'Token inválido!' });

		const now = new Date();

		if (now > user.passwordResetExpires) return res.status(400).send({ error: 'Token expirado, gere um novo.' });

		user.password = password;

		await user.save();

		res.send();
	} catch (err) {
		res.status(400).send({ error: 'Ouve uma instabilidade no sistema, tente novamente.' });
	}
});

module.exports = (app) => app.use('/auth', router);