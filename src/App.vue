<script setup lang="ts">
import theme from "ant-design-vue/es/theme"
import ConfigProvider from "ant-design-vue/es/config-provider"

import Auth from "./views/Auth.vue"
</script>

<template>
  <ConfigProvider
    :theme="{
      algorithm: theme.darkAlgorithm
    }"
  >
    <Auth />
  </ConfigProvider>
</template>

<style scoped></style>
