import { message } from "ant-design-vue"
import { API } from "../utils/http"
import router from "../router"

type User = {
  username: string
  password: string
}

export const loginUser = async (payload: User) => {
  try {
    const { data } = await API.post("auth/login", payload)
    router.push({ name: "Dashboard" })

    return data
  } catch (e: any) {
    message.error(e?.response?.data || "Error happend on login request")
  }
}
