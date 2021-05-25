import React, { Component } from 'react';
import { Link, withRouter } from "react-router-dom";
import NotificationSystem from "react-notification-system";

import { login } from "../services/auth";
import { style } from "../variables/Variables";
import { Card } from 'components/Card/Card';
import { FormInputs } from 'components/FormInputs/FormInputs';

import api from "../services/api";
import Logo from "../assets/img/tim_80x80.png";
import Button from 'components/CustomButton/CustomButton';

class SignIn extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			password: "",
			error: ""
		}

		this.notificationSystem = React.createRef();
	}

	handleNotify = (config) => this.notificationSystem.current.addNotification(config);

	handleSignIn = async (ev) => {
		ev.preventDefault();

		const { email, password } = this.state;

		if (!email || !password) {
			this.setState({ error: "Preencha e-mail e senha para continuar!" });
		} else {
			try {
				const response = await api.post("/auth/authenticate", { email, password });
			
				login(response.data.token);

				this.props.history.push("/app/dashboard");
			} catch (err) {
				this.setState({ error: err.response.data.error });

				this.handleNotify({
					title: <span data-notify="icon" className="pe-7s-delete-user" />,
					message: (
						<div>{this.state.error}</div>
					),
					level: 'warning',
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
			<Card title="Você já tem uma conta?" hCenter
				content={
				<form onSubmit={this.handleSignIn}>
					<div className="text-center">
						<img src={Logo} alt="imagem que simboliza o usuário" />
					</div>
					<FormInputs
					ncols={["col-12"]}
					properties={[
						{
							label: "Email",
							type: "email",
							bsClass: "form-control",
							placeholder: "Email",
							onChange: (ev) => this.setState({ email: ev.target.value })
						}
					]}/>
					<FormInputs
					ncols={["col-12"]}
					properties={[
						{
							label: "Digite sua senha",
							type: "password",
							bsClass: "form-control",
							placeholder: "Digite sua senha",
							onChange: (ev) => this.setState({ password: ev.target.value })
						}
					]}/>
					<div className="text-center">
						<Button bsStyle="success" bsSize="lg" type="submit" fill block>Login</Button>
						<hr />
						<Link to="/signup">Fazer Cadastro</Link>
						<hr />
						<Link to="/sendemail">Recuperar Senha</Link>
					</div>
				</form>
			}/>
		</div>
		);
	}
}

export default withRouter(SignIn);