import React, { Component } from "react";
import NotificationSystem from "react-notification-system";
import { Table, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';

import api from "services/api";
import Card from "components/Card/Card.jsx";
import Button from 'components/CustomButton/CustomButton';

import { project } from "services/auth";
import { style } from "../variables/Variables";
import { FormInputs } from 'components/FormInputs/FormInputs';

class Dashboard extends Component {
	constructor(props, context) {
        super(props, context);

        this.state = {
			showModal: false,
			isLoaded: false,
			lists: [],
			errorSystem: "",
			error: "",
			automobile: "",
			mark: "",
			model: "",
			projectId: ""
		}

		this.handleModalShow = this.handleModalShow.bind(this);
		this.handleModalClose = this.handleModalClose.bind(this);

		this.infoTable = ["Automóvel", "Marca", "Modelo", "Ações"];
		
		this.notificationSystem = React.createRef();
	}

	componentDidMount = async () => {
		try {
			const response = await api.get('/projects');
			const result = response.data.user.projects;

			result.reverse();

			this.setState({
				isLoaded: true,
				lists: result
			});
		} catch (error) {
			this.setState({
				isLoaded: true,
				error
			});
		}
	}

	handleModalShow = (ev) => {
		this.setState({ show: true });
		
		if (ev.target.closest('tr')) {
			this.setState({ projectId: ev.target.closest('tr').id });
		} else {
			this.setState({ projectId: "" });
		}
	}

	handleModalClose = () => this.setState({ show: false });
	
	handleNotify = (config) => this.notificationSystem.current.addNotification(config);

	handleTasksProject = (ev) => project(ev.target.closest('tr').id);

	handleProjectCreate = async (ev) => {
		ev.preventDefault();

		const { automobile, mark, model } = this.state;

		if (!automobile || !mark || !model) {
			this.setState({ error: "Preencha todos os dados para se cadastrar" });
		} else {
			try {
				await api.post("/projects", { automobile, mark, model });

				this.handleNotify({
					title: <span data-notify="icon" className="pe-7s-info" />,
					message: (
						<div>Novo veículo cadastrado!</div>
					),
					level: 'info',
					position: 'tr',
					autoDismiss: 10
				});

				this.componentDidMount();
			} catch (err) {
				this.setState({ error: err.response.data.error });

				this.handleNotify({
					title: <span data-notify="icon" className="pe-7s-delete-user" />,
					message: (
						<div>{this.state.error}</div>
					),
					level: 'danger',
					position: 'tr',
					autoDismiss: 10
				});
			}

			this.handleModalClose();
		}
	}

	handleProjectUpdate = async (ev) => {
		ev.preventDefault();

		const { automobile, mark, model, projectId } = this.state;

		if (!automobile || !mark || !model) {
			this.setState({ error: "Preencha todos os dados para atualizar" });
		} else if (!projectId) {
			this.setState({ error: "O id não foi encontrado!" });
		} else {
			try {
				await api.put(`/projects/${projectId}`, { automobile, mark, model });

				this.handleNotify({
					title: <span data-notify="icon" className="pe-7s-info" />,
					message: (
						<div>Veículo atualizado!</div>
					),
					level: 'info',
					position: 'tr',
					autoDismiss: 10
				});

				this.componentDidMount();
			} catch (err) {
				this.setState({ error: err.response.data.error });

				this.handleNotify({
					title: <span data-notify="icon" className="pe-7s-delete-user" />,
					message: (
						<div>{this.state.error}</div>
					),
					level: 'danger',
					position: 'tr',
					autoDismiss: 10
				});
			}

			this.setState({ projectId: "" });

			this.handleModalClose();
		}
	}

	handleProjectDelete = async (ev) => {
		ev.preventDefault();

		const projectId = ev.target.closest('tr').id;

		try {
			await api.delete(`/projects/${projectId}`);

			this.handleNotify({
				title: <span data-notify="icon" className="pe-7s-info" />,
				message: (
					<div>Veículo deletado!</div>
				),
				level: 'info',
				position: 'tr',
				autoDismiss: 10
			});

			this.componentDidMount();
		} catch (err) {
			this.setState({ error: err.response.data.error });

			this.handleNotify({
				title: <span data-notify="icon" className="pe-7s-delete-user" />,
				message: (
					<div>{this.state.error}</div>
				),
				level: 'danger',
				position: 'tr',
				autoDismiss: 10
			});
		}
	}

  	render() {
		const { errorSystem, isLoaded, lists } = this.state;

		if (errorSystem) {
			this.handleNotify({
				title: <span data-notify="icon" className="pe-7s-delete-user" />,
				message: (
					<div>{errorSystem}</div>
				),
				level: 'danger',
				position: 'tr',
				autoDismiss: 10
			});

			return (
				<div className="content">
					<NotificationSystem ref={this.notificationSystem} style={style}/>
				</div>
			);
		} else if (!isLoaded) {
			return <div>Processando...</div>
		} else {
			return (
				<div className="content">
					<NotificationSystem ref={this.notificationSystem} style={style}/>
					<div className="text-right" style={{ marginBottom: 16 }}>
						<Button bsStyle="primary" onClick={this.handleModalShow} fill>
							Cadastrar novo veículo?
						</Button>
					</div>

					<Modal show={this.state.show} onHide={this.handleModalClose}>
						<Modal.Header>
							<Modal.Title className="text-center">
								{this.state.projectId ? "Atualizar veículo" : "Cadastrar novo veículo" }
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<form className="container" onSubmit={this.state.projectId ? this.handleProjectUpdate : this.handleProjectCreate}>
								<FormInputs
								ncols={["col-12"]}
								properties={[
									{
										label: "Veículo",
										type: "text",
										bsClass: "form-control",
										placeholder: "Ex: Carro, Moto, Caminhão, etc.",
										onChange: (ev) => this.setState({ automobile: ev.target.value })
									}
								]} />
								<FormInputs
								ncols={["col-12"]}
								properties={[
									{
										label: "Marca",
										type: "text",
										bsClass: "form-control",
										placeholder: "Ex: Fiat, Toyota, Ford, etc.",
										onChange: (ev) => this.setState({ mark: ev.target.value })
									}
								]} />
								<FormInputs
								ncols={["col-12"]}
								properties={[
									{
										label: "Modelo",
										type: "text",
										bsClass: "form-control",
										placeholder: "Ex: Palio, Corsa, Corolla, etc.",
										onChange: (ev) => this.setState({ model: ev.target.value })
									}
								]} />
								
								<div className="row text-right">
									<Button onClick={this.handleModalClose} style={{ marginRight: 16 }}>Fechar</Button>
									<Button bsStyle="success" type="submit" fill>
										{this.state.projectId ? "Atualizar" : "Cadastrar" }
									</Button>
								</div>
							</form>
						</Modal.Body>
					</Modal>

					<Card title="Registros"
					category="lista de veículos"
					ctTableFullWidth
					ctTableResponsive
					content={
						<Table hover>
							<thead>
								<tr>
									{this.infoTable.map((prop, key) => (
										<th key={key}>{prop}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{lists.map((list) => (
									<tr id={list._id} key={list._id}>
										<td>{list.automobile}</td>
										<td>{list.mark}</td>
										<td>{list.model}</td>
										<td>
											<OverlayTrigger 
											placement="top" 
											overlay={
												<Tooltip id="view">Visualizar</Tooltip>
											}>
												<Button onClick={this.handleTasksProject} bsStyle="info" href="/app/tasks" fill round>
													<i className="pe-7s-look"></i>
												</Button>
											</OverlayTrigger>
											<OverlayTrigger 
											placement="top" 
											overlay={
												<Tooltip id="edit">Editar</Tooltip>
											}>
												<Button onClick={this.handleModalShow} bsStyle="warning" fill round>
													<i className="pe-7s-pen"></i>
												</Button>
											</OverlayTrigger>
											<OverlayTrigger 
											placement="top" 
											overlay={
												<Tooltip id="delete">Excluir</Tooltip>
											}>
												<Button onClick={this.handleProjectDelete} bsStyle="danger" fill round>
													<i className="pe-7s-trash"></i>
												</Button>
											</OverlayTrigger>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					}/>
				</div>
			);
		}
	}
}

export default Dashboard;