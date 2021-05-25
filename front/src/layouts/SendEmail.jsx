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
import { Link } from "react-router-dom";
import NotificationSystem from "react-notification-system";

import { style } from "../variables/Variables";
import { Card } from "components/Card/Card.jsx";
import { FormInputs } from "components/FormInputs/FormInputs.jsx";

import api from "../services/api";
import Logo from "../assets/img/tim_80x80.png";
import Button from "components/CustomButton/CustomButton.jsx";

class SendEmailPassword extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			error: ""
		}

		this.notificationSystem = React.createRef();
	}

	handleNotify = (config) => this.notificationSystem.current.addNotification(config);

	sendEmail = async (ev) => {
		ev.preventDefault();

		const { email } = this.state;

		if (!email) {
			this.setState({ error: "Preencha todos os dados para mudar sua senha" });
		} else {
			try {
				await api.post("/auth/forgot_password", { email });

				this.props.history.push("/recover");
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
					<form onSubmit={this.sendEmail}>
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
						]} />
						<div className="text-center">
							<Button bsStyle="success" bsSize="lg" type="submit" fill block>Confirmar</Button>
							<hr />
							<Link to="/">Fazer login</Link>
						</div>
					</form>
					}
				/>
			</div>
		);
	}
}

export default SendEmailPassword;