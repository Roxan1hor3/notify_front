<template>
	<CheckboxGroup
		v-model="groups"
		:options="groupOptions"
		style="display: inline-flex; flex-flow: column nowrap; width: 200px"
	/>

	<CheckboxGroup
		v-model="groups"
		:options="groupOptions"
		style="display: inline-flex; flex-flow: column nowrap"
	/>
	<Slider
		style="width: 200px; display: inline-flex"
		range
	/>

	<Select
		v-model="groups"
		mode="multiple"
		:options="groupOptions"
		style="width: 200px"
	/>
	<Select
		v-model="groups"
		mode="multiple"
		:options="groupOptions"
		style="width: 200px"
	/>
	<Select
		v-model="groups"
		mode="multiple"
		:options="groupOptions"
		style="width: 200px"
	/>

	<Button type="primary">Згенерувати</Button>

	<Textarea style="width: 50%" />

	<Button type="primary">Розсилка</Button>
	<Table />
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue"
import { CheckboxGroup } from "ant-design-vue"
import { Select, Slider, Button, Textarea, Table } from "ant-design-vue"

import * as notifyService from "../services/notify"

const initFetch = async () => {
	try {
		const { data: filters } = await notifyService.getFilters()

		console.log(filters)
	} catch {}

	try {
		const { data: balance } = await notifyService.getBalance()

		console.log(balance)
	} catch {}

	try {
		const { data: history } = await notifyService.getNotifyHistory()
		console.log(history)
	} catch {}
}

onMounted(() => {
	initFetch()
})
const groupOptions = [
	{ label: "Apple", value: "Apple" },
	{ label: "Pear", value: "Pear" },
	{ label: "Orange", value: "Orange" }
]

const groups = reactive([])
</script>
