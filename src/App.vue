<script setup lang="ts">
import { ref, computed } from "vue"
import theme from "ant-design-vue/es/theme"
import ConfigProvider from "ant-design-vue/es/config-provider"
import Layout, { Header, Content } from "ant-design-vue/es/layout/layout"
import { MenuItem, Menu } from "ant-design-vue"
import { useRoute } from "vue-router"

const selectedKeys = ref<string[]>(["home"])
const route = useRoute()

const isLoginPage = computed(() => route.name === "Login")
</script>

<template>
	<ConfigProvider
		:theme="{
			algorithm: theme.darkAlgorithm
		}"
	>
		<Layout>
			<Header
				v-if="!isLoginPage"
				class="header-wrapper"
			>
				<Menu
					v-model:selectedKeys="selectedKeys"
					theme="dark"
					mode="horizontal"
				>
					<MenuItem key="home">Розсилка</MenuItem>
				</Menu>
			</Header>

			<Content class="content-wrapper">
				<router-view />
			</Content>
		</Layout>
	</ConfigProvider>
</template>

<style scoped>
.logo {
	float: left;
	width: 120px;
	height: 31px;
	margin: 16px 24px 16px 0;
	background: rgba(255, 255, 255, 0.3);
}

.header-wrapper {
	min-height: 10vh;
	display: flex;
	align-items: center;
}

.content-wrapper {
	height: 90vh;
	min-height: 100%;
	padding: 20px 50px;
}
</style>
