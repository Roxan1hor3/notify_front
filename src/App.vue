<script setup lang="ts">
import theme from "ant-design-vue/es/theme"
import ConfigProvider from "ant-design-vue/es/config-provider"
</script>

<template>
  <ConfigProvider
    :theme="{
      algorithm: theme.darkAlgorithm
    }"
  >
    <router-view />
  </ConfigProvider>
</template>
