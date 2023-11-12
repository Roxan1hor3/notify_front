import axios from "axios"
import router from "../router"
import { message } from "ant-design-vue"

const env = import.meta.env

const baseUrl: string = env.VITE_APP_BASE_URL

const cookie = document.cookie
  .split("; ")
  .find((item) => item.startsWith("Authorization="))
const authorizationHeader = cookie ? cookie.split("=")[1] : ""

const API = axios.create({
  baseURL: `${baseUrl}/api/v1/`,
  timeout: 60000,
  headers: {
    Authorization: authorizationHeader
  }
})

API.interceptors.response.use(
  (response) => {
    if (response.status === 401) {
      router.push({ name: "Login" })
    }

    return response
  },
  (error) => {
    if (error?.response?.status === 401) {
      router.push({ name: "Login" })
    }

    if (error?.response?.status === 404) {
      const err = error?.response?.data?.detail
        ? error.response.data.detail
        : error.response.data

      message.error(err)
    }

    return Promise.reject(error)
  }
)

export { API }
