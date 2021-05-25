import axios from "axios";
import { getTokenKey } from "./auth";

const api = axios.create({
  	baseURL: "http://localhost:4000"
});

api.interceptors.request.use(async (config) => {
	const token = getTokenKey();

	if (token) config.headers.Authorization = `Bearer ${token}`;
	
	return config;
});

export default api;