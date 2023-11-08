import { message } from "ant-design-vue"
import { API } from "../utils/http"
import router from "../router"

type User = {
  username: string
  password: string
}

export const loginUser = async ({ username, password }: User) => {
  const data = new FormData()
  data.append("username", username)
  data.append("password", password)
  try {
    const res = await API.post("auth/login", data)
    router.push({ name: "Dashboard" })

    API.interceptors.request.use(
      (config) => {
        if (res.data.access_token) {
          config.headers["Authorization"] = "Bearer " + res.data.access_token
        }
        config.headers["Content-Type"] = "application/json"
        return config
      },
      (error) => {
        Promise.reject(error)
      }
    )

    return res.data
  } catch (e: any) {
    console.log(e)

    message.error(e?.response?.data || "Error happend on login request")
  }
}

export const getUser = () => {
  return API.get("notify/profile")
}
