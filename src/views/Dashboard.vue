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
        style="width: 250px"
        v-model:value="generateForm.price"
        :min="balanceLimits[0]"
        :max="balanceLimits[1]"
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
        style="width: 100%"
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
        style="width: 100%"
      />
    </FormItem>

    <FormItem
      label="MAC"
      class="dashboard-filters__item"
    >
      <Select
        v-model:value="generateForm.mac_equipment_delivered"
        :options="booleanOptions"
        style="width: 100%"
      />
    </FormItem>

    <FormItem
      label="Знижка"
      class="dashboard-filters__item"
    >
      <Select
        v-model:value="generateForm.is_discount"
        :options="booleanOptions"
        style="width: 100%"
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
      <Upload
        :fileList="[]"
        :beforeUpload="beforeUpload"
      >
        <Button type="primary">
          <template #icon>
            <UploadOutlined />
          </template>
          Розсилка
        </Button>
      </Upload>
    </FormItem>
  </Form>

  <div class="dashboard-table">
    <Table
      :dataSource="dataSource"
      :columns="columns"
      rowKey="uuid"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, value /*, record */ }">
        <div v-if="column.key === 'notify_date'">
          {{ getFormatedDateTime(value) }}
        </div>
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, toRaw } from "vue"

import {
  Select,
  Input,
  Textarea,
  Form,
  FormItem,
  Slider,
  Button,
  Table,
  Upload,
  message
} from "../helpers/ant"
import { UploadProps } from "ant-design-vue/es/upload"
import UploadOutlined from "@ant-design/icons-vue/UploadOutlined"

import { getFormatedDateTime } from "../utils/date"

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
  is_discount: string
  groups: number[]
  packets: number[]
}

type SendForm = {
  message: string
}

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
  is_discount: "",
  groups: [],
  packets: []
})

const balanceLimits = ref<[number, number]>([0, 100])
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
    scopedSlots: {
      customRender: "date"
    },
    title: "Дата"
  },
  {
    key: "message",
    dataIndex: "message",
    title: "Повідомлення"
  }
])

const initFetch = async () => {
  try {
    const { data: filters } = await notifyService.getFilters()

    balanceLimits.value = [filters.min_balance, filters.max_balance]
    generateForm.price = balanceLimits.value

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
  } catch {
    message.error("ERROR")
  }
}

const onSend = async (file: File) => {
  try {
    await notifyService.sendNotifyFile({
      message: toRaw(formSend.message),
      file
    })
  } catch (e: any) {
    message.error(e?.response?.data || e)
  }
}

const onTableChange = async () => {
  try {
    const { data } = await notifyService.getNotifyHistory({
      limit: 10,
      offset: 0
    })

    dataSource.value = data.results
  } catch (e: any) {
    message.error(e?.response?.data || e)
  }
}

const beforeUpload: UploadProps["beforeUpload"] = (file) => {
  onSend(file)
  return false
}

onMounted(() => {
  initFetch()
  onTableChange()
})
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
