<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import theme from "ant-design-vue/es/theme"
import ConfigProvider from "ant-design-vue/es/config-provider"
import Layout, { Header, Content } from "ant-design-vue/es/layout/layout"
import { MenuItem, Menu } from "ant-design-vue"
import { useRoute, useRouter } from "vue-router"
import { getUser } from "./services/auth"

const selectedKeys = ref<string[]>(["home"])
const route = useRoute()
const router = useRouter()

const isLoginPage = computed<boolean>(() => route.name === "Login")
const userData = ref({})

// TODO remove auth logic to router
onMounted(async () => {
  try {
    const { data } = await getUser()

    userData.value = data
  } catch (e) {
    router.push({ name: "Login" })
  }
})
</script>

<template>
  <ConfigProvider
    :theme="{
      algorithm: theme.darkAlgorithm,
      token: {
        borderRadius: 4,
        colorPrimaryBg: '#000000'
      }
    }"
  >
    <Layout>
      <Header v-if="!isLoginPage">
        <Menu
          v-model:selectedKeys="selectedKeys"
          theme="dark"
          mode="horizontal"
        >
          <MenuItem key="home">Розсилка</MenuItem>
        </Menu>
      </Header>

      <Content class="content-wrapper transparent-bg">
        <router-view />
      </Content>
    </Layout>
  </ConfigProvider>
</template>

<style scoped>
.transparent-bg {
  background: #141414;
}
</style>
