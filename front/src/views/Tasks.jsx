import React, { Component } from "react";
import ChartistGraph from "react-chartist";
import NotificationSystem from "react-notification-system";
import { Grid, Row, Col, Table, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';

import { style } from "../variables/Variables";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";

import {
	dataSales,
	optionsSales,
	responsiveSales,
} from "variables/Variables.jsx";
import Card from "components/Card/Card.jsx";
import Button from 'components/CustomButton/CustomButton';
import CustomRadio from 'components/CustomRadio/CustomRadio';
import { FormInputs } from 'components/FormInputs/FormInputs';

import api from "services/api";
import { getTokenProject } from "services/auth";

class Tasks extends Component {
	constructor(props, context) {
        super(props, context);

        this.state = {
			showModal: false,
			isLoaded: false,
			date: new Date().toLocaleDateString('pt-BR', {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			}),
			lists: [],
			balance: 0,
			indicator: "2",
			errorSystem: "",
			error: "",
			fuel: "",
			distance: "",
			consumption: "",
			valueFuel: "",
			title: "",
			value: "",
			taskId: ""
		}

		this.handleModalShow = this.handleModalShow.bind(this);
		this.handleModalClose = this.handleModalClose.bind(this);

		this.projectId = getTokenProject();
		
		this.infoTable = ["Título", "Valor", "Indicador", "Ações"];
		
		this.notificationSystem = React.createRef();
	}

	componentDidMount = async () => {
		try {
			const response = await api.get(`/tasks/${this.projectId}`);
			const result = response.data.project;

			const positive = result.tasks.filter((task) => task.indicator === 1).map((values) => values.value).reduce((acc, sum) => acc + sum, 0);
			const negative = result.tasks.filter((task) => task.indicator === 2).map((values) => values.value).reduce((acc, sum) => acc - sum, 0);
			const resultsChart = [];

			result.tasks.forEach((task) => {
				const date = new Date(task.createdAt);
				const value = task.indicator === 1 ? task.value : task.value * -1;

				dataSales.labels.push(date.toLocaleDateString('pt-BR'));
				resultsChart.push(value);
			});
			
			dataSales.series.push(resultsChart);

			optionsSales.low = Math.min(dataSales.series);
			optionsSales.high = Math.max(dataSales.series);
			
			result.tasks.reverse();
		
			this.setState({
				isLoaded: true,
				lists: result,
				balance: (negative + positive).toLocaleString('pt-BR', {
					style: "currency",
					currency: "BRL",
					minimumFractionDigits: 2
				})
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
			this.setState({ taskId: ev.target.closest('tr').id });
		} else {
			this.setState({ taskId: "" });
		}
	}

	handleModalClose = () => this.setState({ show: false });
	
	handleNotify = (config) => this.notificationSystem.current.addNotification(config);

	handleTaskCreate = async (ev) => {
		ev.preventDefault();

		const { title, value, indicator } = this.state;

		if (!title || !value || !indicator) {
			this.setState({ error: "Preencha todos os dados para se cadastrar" });
		} else {
			try {
				await api.post(`/tasks/${this.projectId}`, { title, value, indicator });

				this.handleNotify({
					title: <span data-notify="icon" className="pe-7s-info" />,
					message: indicator === "1" ? (
						<div>Nova receita cadastrada!</div>
					) : (
						<div>Nova despesa cadastrada!</div>
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

	handleTaskUpdate = async (ev) => {
		ev.preventDefault();

		const { title, value, indicator, taskId } = this.state;

		if (!title || !value || !indicator) {
			this.setState({ error: "Preencha todos os dados para atualizar" });
		} else if (!taskId) {
			this.setState({ error: "O id não foi encontrado!" });
		} else {
			try {
				await api.put(`/tasks/${taskId}`, { title, value, indicator });

				this.handleNotify({
					title: <span data-notify="icon" className="pe-7s-info" />,
					message: indicator === "1" ? (
						<div>Receita atualizada!</div>
					) : (
						<div>Despesa atualizada!</div>
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

			this.setState({ taskId: "" });

			this.handleModalClose();
		}
	}

	handleTaskDelete = async (ev) => {
		ev.preventDefault();

		const taskId = ev.target.closest('tr').id;

		try {
			await api.delete(`/tasks/${taskId}/${this.projectId}`);

			this.handleNotify({
				title: <span data-notify="icon" className="pe-7s-info" />,
				message: (
					<div>Atividade deletada!</div>
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

	handleCalc = (ev) => {
		ev.preventDefault();

		const { distance, consumption, valueFuel } = this.state;

		if (!distance || !consumption || !valueFuel) {
			this.setState({ error: "Preencha todos os dados para calcular" });
		} else {
			const amount = distance / Number(consumption);
			const total = amount * Number(valueFuel);

			const html = `
				<div class="calc-item">
					<h4>Quantidade de Combustível Necessária: ${amount.toFixed(2)} Litros</h4>
				</div>
				<div class="calc-item">
					<h4>Custo total de Combustível: R$ ${total.toFixed(2)}</h4>
				</div>
			`;

			this.setState({ fuel: html });
		}
	}
	  
  	render() {
		const { errorSystem, isLoaded, lists, fuel } = this.state;

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
					<NotificationSystem ref={this.notificationSystem} style={style} />

					<Modal show={this.state.show} onHide={this.handleModalClose}>
						<Modal.Header>
							<Modal.Title>
								{this.state.taskId ? "Atualizar despesa/receita?" : "Cadastrar nova despesa/receita?" }
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<form className="container" onSubmit={this.state.taskId ? this.handleTaskUpdate : this.handleTaskCreate}>
								<FormInputs
								ncols={["col-12"]}
								properties={[
									{
										label: "Título",
										type: "text",
										bsClass: "form-control",
										placeholder: "Ex: Abastecimento, Manutenção, etc.",
										onChange: (ev) => this.setState({ title: ev.target.value })
									}
								]} />
								<FormInputs
								ncols={["col-12"]}
								properties={[
									{
										label: "Valor",
										type: "number",
										bsClass: "form-control",
										placeholder: "Ex: 50, 100, 300, etc.",
										onChange: (ev) => this.setState({ value: ev.target.value })
									}
								]} />

								<Row className="text-center" style={{ paddingBottom: 16 }}>
									<Col lg={6} sm={12}>
									<CustomRadio
										number="expense"
										label="Despesa"
										option="2"
										name="indicator"
										checked={this.state.indicator === "2"}
										onChange={(ev) => this.setState({ indicator: ev.target.value })}
									/>
									</Col>

									<Col lg={6} sm={12}>
									<CustomRadio
										number="recipe"
										label="Receita"
										option="1"
										name="indicator"
										checked={this.state.indicator === "1"}
										onChange={(ev) => this.setState({ indicator: ev.target.value })}
									/>
									</Col>
								</Row>
								
								<div className="row text-right">
									<Button onClick={this.handleModalClose} style={{ marginRight: 16 }}>Fechar</Button>
									<Button bsStyle="success" type="submit" fill>
										{this.state.taskId ? "Atualizar" : "Cadastrar" }
									</Button>
								</div>
							</form>
						</Modal.Body>
					</Modal>
					
					<div className="text-right" style={{ marginBottom: 16 }}>
						<Button bsStyle="primary" onClick={this.handleModalShow} fill>
							Cadastrar nova despesa?
						</Button>
					</div>

					<Grid style={{ padding: 0 }} fluid>
						<Row>
							<Col lg={6} sm={12}>
							<StatsCard
								bigIcon={<i className="pe-7s-server text-warning" />}
								statsText="Quantidade de Cadastros"
								statsValue={this.state.lists.tasks.length}
								statsIcon={<i className="fa fa-refresh" />}
								statsIconText={this.state.date}
							/>
							</Col>
							<Col lg={6} sm={12}>
							<StatsCard
								bigIcon={<i className="pe-7s-wallet text-success" />}
								statsText="Saldo"
								statsValue={this.state.balance}
								statsIcon={<i className="fa fa-calendar-o" />}
								statsIconText={this.state.date}
							/>
							</Col>
						</Row>
					</Grid>

					<Card title="Registros"
					category="lista de despesas"
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
								{lists.tasks.map((list) => (
									<tr id={list._id} key={list._id}>
										<td>{list.title}</td>
										<td>{list.value}</td>
										<td>
											{list.indicator === 1 ? (
												<span className="badge badge-success">Receita</span>
											) : (
												<span className="badge badge-danger">Despesa</span>
											)}
										</td>
										<td>
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
												<Button onClick={this.handleTaskDelete} bsStyle="danger" fill round>
													<i className="pe-7s-trash"></i>
												</Button>
											</OverlayTrigger>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					}/>

					<Card title="Gráfico"
					category="listagem de despesas e receitas"
					ctTableFullWidth
					ctTableResponsive
					content={
						<ChartistGraph
						data={dataSales}
						type="Line"
						options={optionsSales}
						responsiveOptions={responsiveSales}/>
					}/>

					<Card title="Cálculadora"
					category="Calcule seu gasto de combustível"
					ctTableFullWidth
					ctTableResponsive
					content={
						<form className="container-fluid" onSubmit={this.handleCalc}>
							<div className="calc-result" dangerouslySetInnerHTML={{ __html: fuel }} />

							<FormInputs
							ncols={["col-12"]}
							properties={[
								{
									label: "Distância",
									type: "number",
									bsClass: "form-control",
									placeholder: "Ex: 50, 100, 300, etc.",
									onChange: (ev) => this.setState({ distance: ev.target.value })
								}
							]} />

							<FormInputs
							ncols={["col-12"]}
							properties={[
								{
									label: "Consumo de combustível a cada 100KM",
									type: "text",
									bsClass: "form-control",
									placeholder: "Ex: 5, 10, 13.5, etc.",
									onChange: (ev) => this.setState({ consumption: ev.target.value })
								}
							]} />

							<FormInputs
							ncols={["col-12"]}
							properties={[
								{
									label: "Valor do combustível por litro",
									type: "text",
									bsClass: "form-control",
									placeholder: "Ex: 4.5, 5, 5.33, etc.",
									onChange: (ev) => this.setState({ valueFuel: ev.target.value })
								}
							]} />

							<div className="text-right">
								<Button bsStyle="success" type="submit" fill>
									Resultado
								</Button>
							</div>
						</form>
					}/>
				</div>
			);
		}
	}
}

export default Tasks;