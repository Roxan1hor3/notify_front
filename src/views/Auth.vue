<script setup lang="ts">
import { reactive } from "vue"

import Form, { FormItem } from "ant-design-vue/es/form"
import Modal from "ant-design-vue/es/modal"
import Input from "ant-design-vue/es/input"
import Button from "ant-design-vue/es/button"
import { TypographyTitle } from "ant-design-vue/es"

interface FormState {
  username: string
  password: string
}

const formState = reactive<FormState>({
  username: "",
  password: ""
})
const onSubmit = () => {}
</script>

<template>
  <Modal
    :open="true"
    :closable="false"
    centered
  >
    <template #title>
      <TypographyTitle class="auth-title">Notify App</TypographyTitle>
    </template>
    <Form
      :model="formState"
      name="basic"
      layout="vertical"
    >
      <FormItem label="Username">
        <Input v-model="formState.username" />
      </FormItem>
      <FormItem label="Password">
        <Input v-model="formState.password" />
      </FormItem>
    </Form>

    <template #footer>
      <Button
        type="primary"
        block
        @click="onSubmit()"
      >
        Log in
      </Button>
    </template>
  </Modal>
</template>

<style scoped>
.auth-title {
  width: 100%;
  text-align: center;
}
</style>
