import axios from "axios"
import router from "../router"

const env = import.meta.env

const baseUrl: string = env.VITE_APP_BASE_URL

const API = axios.create({
  baseURL: `${baseUrl}/api/v1/`,
  timeout: 60000,
  headers: {}
})

API.interceptors.response.use(
  (response) => {
    if (response.status === 401) {
      router.push({ name: "Login" })
    }

    return response
  },
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error.message)
  }
)

export { API }
