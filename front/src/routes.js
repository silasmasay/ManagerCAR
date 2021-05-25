import Dashboard from "views/Dashboard.jsx";
import Tasks from "views/Tasks.jsx";

const dashboardRoutes = [
	{
		path: "/dashboard",
		name: "Automóveis",
		icon: "pe-7s-graph",
		component: Dashboard,
		layout: "/app"
	},
	{
		path: "/tasks",
		name: "Receitas e Despesas",
		icon: "",
		component: Tasks,
		layout: "/app"
	}
];

export default dashboardRoutes;
