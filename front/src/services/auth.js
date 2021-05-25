const TOKEN_KEY = "@ManagerCAR-Token";
const TOKEN_PROJECT = "@Project-Id";

export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;

export const getTokenKey = () => localStorage.getItem(TOKEN_KEY);

export const getTokenProject = () => localStorage.getItem(TOKEN_PROJECT);

export const project = (token) => {
	localStorage.setItem(TOKEN_PROJECT, token);
}

export const login = (token) => {
  	localStorage.setItem(TOKEN_KEY, token);
};

export const logout = () => {
  	localStorage.removeItem(TOKEN_KEY);
};