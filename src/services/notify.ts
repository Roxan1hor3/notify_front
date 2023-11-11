import { API } from "../utils/http"
export const simpleBuildQuery = (params: any) => {
  const arr = Object.keys(params)
    .filter((key) => {
      return Array.isArray(params[key])
        ? params[key].join(",")
        : params[key].toString()
    })
    .map((key) => {
      return `${key}=${
        Array.isArray(params[key]) ? params[key].join(",") : params[key]
      }`
    })

  return `?${arr.join("&")}`
}

export const getFilters = () => {
  return API.get("notify/filters/")
}

export const getBalance = () => {
  return API.get("notify/current_balance/")
}

export const getUsersFile = (query: any) => {
  const { price, ...data } = query
  const [balance_gte = 0, balance_lte = 0] = price
  return API.get(
    `notify/users_file/${simpleBuildQuery({
      ...data,
      balance_gte,
      balance_lte
    })}`,
    {
      responseType: "arraybuffer",
      headers: { "Content-Type": "blob" }
    }
  )
}

export const getNotifyHistory = (query: any) => {
  return API.get(`notify/notify_history/${simpleBuildQuery(query)}`)
}

export const sendNotifyFile = ({ message, file }: any) => {
  const data = new FormData()

  data.append("sms_file", file)
  return API.post(`notify/send_sms_by_file/?message=${message}`, data)
}

export const getNotifyFile = (uuid: string) => {
  return API.get(`notify/notify_report_file?notify_uuid=${uuid}`)
}
