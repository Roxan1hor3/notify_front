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
      <input
        ref="inputRef"
        type="file"
        style="visibility: hidden"
        accept="text/csv"
        @change="beforeUpload"
      />
      <Button
        :disabled="!formSend.message"
        type="primary"
        :loading="isSending"
        @click="onInputClick"
      >
        <template #icon>
          <UploadOutlined />
        </template>
        Розсилка
      </Button>
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

  <Modal
    :visible="openConfirmModal"
    :width="400"
    title="Виберіть спосіб розсилки"
    @cancel="openConfirmModal = false"
  >
    <template #footer>
      <div class="modal-footer">
        <Button
          :loading="isSending"
          @click="sendBySms"
        >
          SMS
        </Button>
        <Button
          type="primary"
          :loading="isSending"
          @click="sendByTelegram"
        >
          Telegram
        </Button>
      </div>
    </template>
  </Modal>
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
  message,
  Modal
} from "../helpers/ant"
import { getCSVFile } from "../helpers/csv.ts"
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

const inputRef = ref<HTMLInputElement>()
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
const openConfirmModal = ref<boolean>(false)
const currentFile = ref<File>()

const columns = computed(() => [
  {
    key: "sent_by",
    dataIndex: "sent_by",
    title: "Sent by",
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

const onInputClick = () => {
  if (!inputRef.value) return
  inputRef.value.click()
}

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

    getCSVFile(data)
  } finally {
    isGenerating.value = false
  }
}

const onSend = async (file: File) => {
  if (!formSend.message) return

  currentFile.value = file
  openConfirmModal.value = true
}

const sendBySms = async () => {
  try {
    isSending.value = true
    const { data } = await notifyService.sendNotifyFile({
      message: toRaw(formSend.message),
      file: currentFile.value
    })

    getCSVFile(data)

    message.success("Успішно")
    onTableChange()
  } catch (e: any) {
    message.error(e?.response?.data?.detail || "Помилка")
  } finally {
    isSending.value = false
    currentFile.value = undefined
    openConfirmModal.value = false
    clearInput()
  }
}

const sendByTelegram = async () => {
  try {
    isSending.value = true

    const { data } = await notifyService.sendNotifyFileTelegram({
      message: toRaw(formSend.message),
      file: currentFile.value
    })

    getCSVFile(data)

    message.success("Успішно")
    onTableChange()
  } catch (e: any) {
    message.error(e?.response?.data?.detail || "Помилка")
  } finally {
    isSending.value = false
    currentFile.value = undefined
    openConfirmModal.value = false
    clearInput()
  }
}

const getReport = async ({ uuid }: any) => {
  try {
    message.info("Звіт завантажується")
    const { data } = await notifyService.getNotifyFile(uuid)

    getCSVFile(data)
  } finally {
  }
}

const clearInput = () => {
  if (!inputRef.value) return
  inputRef.value.value = ""
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

const beforeUpload = (e: Event) => {
  const { files } = e.target as any
  const [file] = files
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

.modal-footer {
  display: flex;
  gap: 16px;
  justify-content: space-between;

  & > * {
    display: inherit;
    gap: inherit;
  }
}
</style>
