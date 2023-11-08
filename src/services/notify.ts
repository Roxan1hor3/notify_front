import { API } from "../utils/http"

export const getFilters = () => {
	return API.get("notify/filters/")
}

export const getBalance = () => {
	return API.get("notify/current_balance/")
}

export const getUsersFile = () => {
	return API.get("notify/users_file/")
}

export const getNotifyHistory = () => {
	return API.get("notify/notify_history/")
}

export const getNotifyFile = () => {
	return API.get("notify/notify_resport_file/")
}
