/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from "react";
import NotificationSystem from "react-notification-system";

import { style } from "../variables/Variables";
import { Card } from "components/Card/Card.jsx";
import { FormInputs } from "components/FormInputs/FormInputs.jsx";

import api from "../services/api";
import Logo from "../assets/img/tim_80x80.png";
import Button from "components/CustomButton/CustomButton.jsx";

class RecoverPassword extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			token: "",
			password: "",
			error: ""
		}

		this.notificationSystem = React.createRef();
	}
	
	handleNotify = (config) => this.notificationSystem.current.addNotification(config);

	resetPassword = async (ev) => {
		ev.preventDefault();

		const { email, password, token } = this.state;

		if (!email || !password || !token) {
			this.setState({ error: "Preencha todos os dados para mudar sua senha" });
		} else {
			try {
				await api.post("/auth/reset_password", { email, token, password });

				this.props.history.push("/");
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
				<Card title="Trocar Senha" hCenter
					content={
					<form onSubmit={this.resetPassword}>
						<div className="text-center">
							<img src={Logo} alt="imagem que simboliza o usuário" />
						</div>
						<FormInputs
						ncols={["col-12"]}
						properties={[
							{
								label: "Código",
								type: "text",
								bsClass: "form-control",
								placeholder: "Código",
								onChange: (ev) => this.setState({ token: ev.target.value })
							}
						]} />
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
						]} />
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
						]} />

						<Button bsStyle="success" bsSize="lg" type="submit" fill block>Confirmar</Button>
						<div className="clearfix" />
					</form>
					}
				/>
			</div>
		);
	}
}

export default RecoverPassword;