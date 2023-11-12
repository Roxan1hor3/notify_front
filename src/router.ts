import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/",
    component: () => import("./views/Dashboard.vue"),
    name: "Dashboard"
  },
  { path: "/login", component: () => import("./views/Auth.vue"), name: "Login" }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
