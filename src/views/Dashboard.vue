<template>
	<Form
		class="dashboard-filters"
		layout="vertical"
	>
		<FormItem
			label="Групи"
			class="dashboard-filters__item"
		>
			<Select
				v-model:value="generateForm.groups"
				:options="groupOptions"
				mode="tags"
				placeholder="Будь-які"
				:maxTagCount="1"
				style="width: 200px"
			/>
		</FormItem>

		<FormItem
			label="Пакети"
			class="dashboard-filters__item"
		>
			<Select
				v-model:value="generateForm.packets"
				:options="packagesOptions"
				mode="tags"
				placeholder="Будь-які"
				:maxTagCount="1"
				style="width: 200px"
			/>
		</FormItem>

		<FormItem
			label="Ціна"
			class="dashboard-filters__item"
		>
			<Slider
				style="width: 200px; display: inline-flex"
				v-model:value="generateForm.price"
				range
			/>
		</FormItem>

		<FormItem
			label="Авторизований"
			class="dashboard-filters__item"
		>
			<Select
				v-model:value="generateForm.is_auth"
				:options="booleanOptions"
				style="width: 200px"
			/>
		</FormItem>

		<FormItem
			label="ПІБ"
			class="dashboard-filters__item"
		>
			<Input v-model:value="generateForm.fio" />
		</FormItem>

		<FormItem
			label="S/N"
			class="dashboard-filters__item"
		>
			<Select
				v-model:value="generateForm.sn_onu_equipment_delivered"
				:options="booleanOptions"
				style="width: 200px"
			/>
		</FormItem>

		<FormItem
			label="MAC"
			class="dashboard-filters__item"
		>
			<Select
				v-model:value="generateForm.mac_equipment_delivered"
				:options="booleanOptions"
				style="width: 200px"
			/>
		</FormItem>

		<FormItem>
			<Button
				type="primary"
				@click="onGenerate()"
				>Згенерувати</Button
			>
		</FormItem>
	</Form>

	<Form
		class="dashboard-filters"
		layout="vertical"
	>
		<FormItem class="dashboard-filters__item dashboard-filters__item--wide">
			<Textarea v-model:value="formSend.message" />
		</FormItem>

		<FormItem>
			<Button type="primary">Розсилка</Button>
			<input
				type="file"
				@change="onSend"
			/>
		</FormItem>
	</Form>
	<div class="dashboard-table">
		<Table
			:dataSource="dataSource"
			:columns="columns"
			@change="onTableChange"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, toRaw } from "vue"
import {
	Select,
	Slider,
	Button,
	Textarea,
	Table,
	Input,
	FormItem,
	Form,
	notification,
	message
} from "ant-design-vue"

import * as notifyService from "../services/notify"

type GroupOption = {
	grp_name: string
	grp_id: number
}

type PackagesOption = {
	name: string
	id: number
}

type AntSelectOption = {
	label: string
	value: number | string
}

type GenerateForm = {
	price: [number, number]
	is_auth: string
	fio: string
	serialNumber: string
	mac_equipment_delivered: string
	sn_onu_equipment_delivered: string
	groups: number[]
	packets: number[]
}

type SendForm = {
	message: string
}

const initFetch = async () => {
	try {
		const { data: filters } = await notifyService.getFilters()
		console.log(filters)

		groupOptions.value = filters.groups.map(
			({ grp_name, grp_id }: GroupOption): AntSelectOption => ({
				label: grp_name,
				value: grp_id
			})
		)

		packagesOptions.value = filters.packets.map(
			({ name, id }: PackagesOption): AntSelectOption => ({
				label: name,
				value: id
			})
		)
	} catch (e: any) {
		message.error(e?.response?.data || e)
	}

	// try {
	// 	const { data: balance } = await notifyService.getBalance()

	// 	console.log(balance)
	// } catch {}
}
const onGenerate = async () => {
	try {
		const { data } = await notifyService.getUsersFile(toRaw(generateForm))
		const blob = new Blob([data], { type: "text/csv" })

		const url = window.URL.createObjectURL(blob)

		const a = document.createElement("a")

		a.setAttribute("href", url)

		a.setAttribute("download", "download.csv")

		a.click()
	} finally {
		notification.error({ message: "ERROR" })
	}
}

const onSend = async (e: any) => {
	const file: File = e.target.files[0]
	try {
		const { data } = await notifyService.sendNotifyFile({ message: toRaw(formSend.message), file })
		console.log(data)
	} catch (e: any) {
		message.error(e?.response?.data || e)
	}
}

const onTableChange = async () => {
	try {
		const { data } = await notifyService.getNotifyHistory({ limit: 10, offset: 0 })

		dataSource.value = data.results
	} catch (e: any) {
		message.error(e?.response?.data || e)
	}
}

onMounted(() => {
	initFetch()
})

const booleanOptions = [
	{
		value: "",
		label: "All"
	},
	{
		value: "true",
		label: "Yes"
	},
	{
		value: "false",
		label: "No"
	}
]

const groupOptions = ref<Array<AntSelectOption>>([])
const packagesOptions = ref<Array<AntSelectOption>>([])

const generateForm = reactive<GenerateForm>({
	price: [0, 100],
	is_auth: "",
	fio: "",
	serialNumber: "",
	mac_equipment_delivered: "",
	sn_onu_equipment_delivered: "",
	groups: [],
	packets: []
})
const formSend = reactive<SendForm>({
	message: ""
})

const dataSource = ref([])

const columns = computed(() => [
	{
		key: "uuid",
		dataIndex: "uuid",
		title: "Id"
	},
	{
		key: "user_uuid",
		dataIndex: "user_uuid",
		title: "userId"
	},
	{
		key: "username",
		dataIndex: "username",
		title: "Користувач"
	},
	{
		key: "notify_date",
		dataIndex: "notify_date",
		title: "Дата"
	},
	{
		key: "message",
		dataIndex: "message",
		title: "Повідомлення"
	}
])
</script>

<style scoped lang="scss">
.dashboard-filters {
	display: flex;
	flex-flow: row wrap;
	align-items: flex-end;
	gap: 16px;

	margin: 16px;

	&__item {
		max-width: 150px;

		&--wide {
			width: 50%;
			min-width: 40dvw;
		}

		& * {
			max-width: 100%;
		}
	}
}

.dashboard-table {
	margin: 16px;
}
</style>
