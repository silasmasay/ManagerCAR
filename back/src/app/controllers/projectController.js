const express = require('express');

const authMiddleware = require('../middlewares/auth');
const Project = require('../models/project');
const User = require('../models/user');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	try {
		const user = await User.findById(req.userId).populate(['projects']);

		return res.send({ user });
	} catch (err) {
		return res.status(400).send({ error: 'Ouve um erro na listagem dos dados!' });
	}
});

router.post('/', async (req, res) => {
	try {
		const { automobile, mark, model } = req.body;

		const project = await Project.create({
			automobile,
			mark,
			model,
			user: req.userId
		});

		await project.save();

		const user = await User.findById(req.userId);

		user.projects.push(project);
		
		await user.save();

		return res.send({ user });
	} catch (err) {
		return res.status(400).send({ error: 'Ouve um erro na criação da atividade!' });
	}
});

router.put('/:projectId', async (req, res) => {
	try {
		const { automobile, mark, model } = req.body;
		
		const project = await Project.findByIdAndUpdate(req.params.projectId, { 
			automobile, 
			mark,
			model
		}, { 
			new: true 
		});

		await project.save();

		return res.send({ project });
	} catch (err) {
		return res.status(400).send({ error: 'Ouve um erro na atualização da atividade!' });
	}
});

router.delete('/:projectId', async (req, res) => {
	try {
		await Project.findByIdAndRemove(req.params.projectId);

		const user = await User.findById(req.userId);

		user.projects.splice(user.projects.indexOf(req.params.projectId), 1);

		await user.save();

		return res.send({ user });
	} catch (err) {
		return res.status(400).send({ error: 'Ouve um erro na remoção do dado!' });
	}
});

module.exports = (app) => app.use('/projects', router);