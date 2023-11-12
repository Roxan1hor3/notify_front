<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import theme from "ant-design-vue/es/theme"
import ConfigProvider from "ant-design-vue/es/config-provider"
import Layout, { Header, Content } from "ant-design-vue/es/layout/layout"
import { MenuItem, Menu, Divider } from "ant-design-vue"
import { useRoute, useRouter } from "vue-router"
import { getUser } from "./services/auth"
import { Button } from "./helpers/ant"
import PowerOffOutlined from "@ant-design/icons-vue/PoweroffOutlined"
import { logoutUser } from "./services/auth"

const selectedKeys = ref<string[]>(["home"])
const route = useRoute()
const router = useRouter()

const isLoginPage = computed<boolean>(() => route.name === "Login")
const userData = ref({})

const turboSMSBalance = ref<number>(0)

const onLogout = async () => {
  try {
    await logoutUser()
    document.cookie = "Authorization=; Max-Age=0; path=/;"

    router.push({ name: "Login" })
  } catch (e) {
    console.log(e)
  }
}

// TODO remove auth logic to router
onMounted(async () => {
  try {
    const { data } = await getUser()

    userData.value = data
  } catch (e) {}
})
const onBalanceChange = ({ current_balance }: Record<string, number>) => {
  turboSMSBalance.value = current_balance
}
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
      <Header
        v-if="!isLoginPage"
        class="header"
      >
        <Menu
          v-model:selectedKeys="selectedKeys"
          theme="dark"
          mode="horizontal"
        >
          <MenuItem key="home">Розсилка</MenuItem>
        </Menu>
        <div>
          <span>
            Баланс TurboSMS:
            {{ turboSMSBalance }}
          </span>

          <Divider type="vertical" />

          <Button
            type="text"
            @click="onLogout"
          >
            <PowerOffOutlined /> Вихід
          </Button>
        </div>
      </Header>

      <Content class="content-wrapper transparent-bg">
        <router-view @balanceChange="onBalanceChange" />
      </Content>
    </Layout>
  </ConfigProvider>
</template>

<style scoped>
.transparent-bg {
  background: #141414;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
