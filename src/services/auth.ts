import { API } from "../utils/http"
import router from "../router"

type User = {
  username: string
  password: string
}

export const loginUser = async ({ username, password }: User) => {
  return new Promise(async (resolve) => {
    const data = new FormData()

    data.append("username", username)
    data.append("password", password)

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

    document.cookie = `Authorization=Bearer ${res.data.access_token}; max-age=3600`
    resolve(res.data)
  })
}

export const getUser = () => {
  return API.get("notify/profile")
}

export const logoutUser = () => {
  return API.post("notify/logout")
}
