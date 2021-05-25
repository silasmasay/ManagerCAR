const express = require('express');

const authMiddleware = require('../middlewares/auth');
const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);

router.get('/:projectId', async (req, res) => {
	try {
		const project = await Project.findById(req.params.projectId).populate(['tasks']);

		return res.send({ project });
	} catch (err) {
		return res.status(400).send({ error: 'Ouve um erro na listagem do dado filtrado!' });
	}
});

router.post('/:projectId', async (req, res) => {
	try {
		const { title, value, indicator } = req.body;
		
		const task = await Task.create({
			title,
			value,
			indicator,
			project: req.params.projectId,
			assignedTo: req.userId
		});

		await task.save();

		const project = await Project.findById(req.params.projectId);

		project.tasks.push(task);

		await project.save();

		return res.send({ project });
	} catch (err) {
		return res.status(400).send({ error: 'Ouve um erro na criação da atividade!' });
	}
});

router.put('/:taskId', async (req, res) => {
	try {
		const { title, value, indicator } = req.body;
		
		const task = await Task.findByIdAndUpdate(req.params.taskId, {
			title,
			value,
			indicator
		}, {
			new: true
		});

		await task.save();

		return res.send({ task });
	} catch (err) {
		return res.status(400).send({ error: 'Ouve um erro na atualização da atividade!' });
	}
});

router.delete('/:taskId/:projectId', async (req, res) => {
	try {
		await Task.findByIdAndRemove(req.params.taskId);

		const project = await Project.findById(req.params.projectId);

		project.tasks.splice(project.tasks.indexOf(req.params.taskId), 1);

		await project.save();

		return res.send({ project });
	} catch (err) {
		return res.status(400).send({ error: 'Ouve um erro na remoção do dado!' });
	}
});

module.exports = (app) => app.use('/tasks', router);