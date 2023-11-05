<script setup lang="ts">
import { reactive, ref } from "vue"

import Form, { FormItem } from "ant-design-vue/es/form"
import Modal from "ant-design-vue/es/modal"
import Input from "ant-design-vue/es/input"
import Button from "ant-design-vue/es/button"
import { TypographyTitle } from "ant-design-vue/es"
import type { Rule } from "ant-design-vue/es/form"
import type { UnwrapRef } from "vue"

import { loginUser } from "../services/auth"

interface FormState {
  username: string
  password: string
}
const formRef = ref()

const formState: UnwrapRef<FormState> = reactive({
  username: "",
  password: ""
})

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: "Please input user name" }],
  password: [{ required: true, message: "Please input password" }]
}

const onSubmit = async () => {
  formRef.value.validate().then(async () => {
    loginUser(formState)
  })
}
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
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
      name="login-form"
    >
      <FormItem
        label="Username"
        name="username"
      >
        <Input v-model:value="formState.username" />
      </FormItem>
      <FormItem
        label="Password"
        name="password"
      >
        <Input v-model:value="formState.password" />
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
