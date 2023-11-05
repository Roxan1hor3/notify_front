import { createRouter, createWebHistory } from "vue-router"

import Auth from "./views/Auth.vue"

const routes = [
  { path: "/", component: Auth, name: "Dashboard" },
  { path: "/login", component: () => Auth, name: "Login" }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
