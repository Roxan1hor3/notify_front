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
        :loading="isGenerating"
        @click="onGenerate()"
      >
        Згенерувати
      </Button>
    </FormItem>
  </Form>

  <Form
    class="dashboard-filters"
    layout="vertical"
  >
    <FormItem
      class="dashboard-filters__item dashboard-filters__item--wide"
      required
    >
      <Textarea v-model:value="formSend.message" />
    </FormItem>

    <FormItem>
      <Upload
        :fileList="[]"
        :beforeUpload="beforeUpload"
      >
        <Button
          type="primary"
          :loading="isSending"
        >
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
      :loading="fetching"
      :pagination="paginationInfo"
      @change="onTableChange"
    >
      <template #title>
        <InputSearch
          v-model:value="filteredInfo.username"
          style="width: 300px"
          placeholder="Введіть користувача"
          @search="onTableChange()"
        />
      </template>
      <template #bodyCell="{ column, value, record }">
        <div v-if="column.key === 'notify_date'">
          {{ getFormatedDateTime(value) }}
        </div>
        <div v-if="column.key === 'actions'">
          <Button
            type="primary"
            @click="getReport(record)"
          >
            <template #icon>
              <DownloadOutlined />
            </template>
            Звіт
          </Button>
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
  InputSearch,
  Form,
  FormItem,
  Slider,
  Button,
  Table,
  Upload,
  message
} from "../helpers/ant"
import { getExcelFile } from "../helpers/excel"
import { UploadProps } from "ant-design-vue/es/upload"
import UploadOutlined from "@ant-design/icons-vue/UploadOutlined"
import DownloadOutlined from "@ant-design/icons-vue/DownloadOutlined"

import { getFormatedDateTime } from "../utils/date"

import * as notifyService from "../services/notify"
import { PaginationProps } from "ant-design-vue"
import { TablePaginationConfig } from "ant-design-vue/es/table/interface"

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

type DashboardEmits = {
  (e: "balanceChange", data: Record<string, number>): void
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

const emit = defineEmits<DashboardEmits>()

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

const fetching = ref<boolean>(false)
const dataSource = ref([])

const paginationInfo = ref<PaginationProps>({
  current: 1,
  pageSize: 10
})

const filteredInfo = ref<Record<string, string>>({
  username: ""
})

const sortedInfo = ref({})

const isGenerating = ref<boolean>(false)
const isSending = ref<boolean>(false)

const columns = computed(() => [
  {
    key: "uuid",
    dataIndex: "uuid",
    title: "Notify Id",
    width: 200
  },
  {
    key: "user_uuid",
    dataIndex: "user_uuid",
    title: "ID користувача",
    width: 170
  },
  {
    key: "username",
    dataIndex: "username",
    title: "Користувач",
    width: 150
  },
  {
    key: "notify_date",
    dataIndex: "notify_date",
    title: "Дата",
    sorter: true,
    width: 150
  },
  {
    key: "message",
    dataIndex: "message",
    title: "Повідомлення"
  },
  {
    key: "actions",
    width: 60
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

    const { data: currentBalanceData } = await notifyService.getBalance()

    emit("balanceChange", currentBalanceData)
  } finally {
  }
}

const onGenerate = async () => {
  try {
    isGenerating.value = true

    const { data } = await notifyService.getUsersFile(toRaw(generateForm))

    getExcelFile(data)
  } finally {
    isGenerating.value = false
  }
}

const onSend = async (file: File) => {
  if (!formSend.message) return

  try {
    isSending.value = true

    const { data } = await notifyService.sendNotifyFile({
      message: toRaw(formSend.message),
      file
    })

    getExcelFile(data)

    message.success("Успішно")
    onTableChange()
  } finally {
    isSending.value = false
  }
}

const getReport = async ({ uuid }: any) => {
  try {
    message.info("Звіт завантажується")
    const { data } = await notifyService.getNotifyFile(uuid)

    getExcelFile(data)
  } finally {
  }
}

const onTableChange = async (
  pagination: TablePaginationConfig = paginationInfo.value,
  _: any = {},
  sorter = sortedInfo.value
) => {
  try {
    fetching.value = true

    const { data } = await notifyService.getNotifyHistory({
      pagination,
      filters: filteredInfo.value,
      sorter
    })

    paginationInfo.value = { ...pagination, total: data.count }
    sortedInfo.value = sorter

    dataSource.value = data.results
  } finally {
    fetching.value = false
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
