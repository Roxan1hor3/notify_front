import { createRouter, createWebHistory } from "vue-router"

import Auth from "./views/Auth.vue"
import Dashboard from "./views/Dashboard.vue"

const routes = [
	{ path: "/", component: () => Dashboard, name: "Dashboard" },
	{ path: "/login", component: () => Auth, name: "Login" }
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router
