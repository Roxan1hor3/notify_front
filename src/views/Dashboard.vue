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
import { reactive } from "vue"
import { CheckboxGroup } from "ant-design-vue"
import { Select, Slider, Button, Textarea, Table } from "ant-design-vue"

const groupOptions = [
	{ label: "Apple", value: "Apple" },
	{ label: "Pear", value: "Pear" },
	{ label: "Orange", value: "Orange" }
]

const groups = reactive([])
</script>
