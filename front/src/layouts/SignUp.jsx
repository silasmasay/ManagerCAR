import React, { Component } from "react";
import { Link } from "react-router-dom";
import NotificationSystem from "react-notification-system";

import { style } from "../variables/Variables";
import { Card } from 'components/Card/Card';
import { FormInputs } from 'components/FormInputs/FormInputs';

import api from "../services/api";
import Logo from "../assets/img/tim_80x80.png";
import Button from 'components/CustomButton/CustomButton';

class SignUp extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			email: "",
			password: "",
			error: ""
		}

		this.notificationSystem = React.createRef();
	}

	handleNotify = (config) => this.notificationSystem.current.addNotification(config);

	handleSignUp = async (ev) => {
		ev.preventDefault();

		const { name, email, password } = this.state;

		if (!name || !email || !password) {
			this.setState({ error: "Preencha todos os dados para se cadastrar" });
		} else {
			try {
				await api.post("/auth/register", { name, email, password });

				this.props.history.push("/");
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
	}

	render() {
		return (
		<div className="card-login">
			<NotificationSystem ref={this.notificationSystem} style={style}/>
			<Card title="Realizar Cadastro" hCenter
				content={
				<form onSubmit={this.handleSignUp}>
					<div className="text-center">
						<img src={Logo} alt="imagem que simboliza o usuário" />
					</div>
					{this.state.error && <p>{this.state.error}</p>}
					<FormInputs
					ncols={["col-12"]}
					properties={[
						{
							label: "Nome de usuário",
							type: "text",
							bsClass: "form-control",
							placeholder: "Nome de usuário",
							onChange: (ev) => this.setState({ name: ev.target.value })
						}
					]}/>
					<FormInputs
					ncols={["col-12"]}
					properties={[
						{
							label: "E-mail",
							type: "email",
							bsClass: "form-control",
							placeholder: "E-mail",
							onChange: (ev) => this.setState({ email: ev.target.value })
						}
					]}/>
					<FormInputs
					ncols={["col-12"]}
					properties={[
						{
							label: "Senha",
							type: "password",
							bsClass: "form-control",
							placeholder: "Senha",
							onChange: (ev) => this.setState({ password: ev.target.value })
						}
					]}/>
					<div className="text-center">
						<Button bsStyle="success" bsSize="lg" type="submit" fill block>Cadastrar</Button>
						<hr />
						<Link to="/">Fazer login</Link>
					</div>
				</form>
			}/>
		</div>
		);
	}
}

export default SignUp;