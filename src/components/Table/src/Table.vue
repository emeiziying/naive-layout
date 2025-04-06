<template>
  <div class="table-toolbar">
    <!--顶部左侧区域-->
    <div class="table-toolbar-left flex items-center">
      <template v-if="props.title">
        <div class="table-toolbar-left-title">
          {{ props.title }}
          <n-tooltip v-if="props.titleTooltip" trigger="hover">
            <template #trigger>
              <n-icon class="ml-1 cursor-pointer text-gray-400" size="18">
                <QuestionCircleOutlined />
              </n-icon>
            </template>
            {{ props.titleTooltip }}
          </n-tooltip>
        </div>
      </template>
      <slot name="tableTitle"></slot>
    </div>

    <div class="table-toolbar-right flex items-center leading-none">
      <!--顶部右侧区域-->
      <slot name="toolbar"></slot>

      <template v-if="props.showToolBarActions">
        <!--斑马纹-->
        <n-tooltip trigger="hover">
          <template #trigger>
            <div class="table-toolbar-right-icon mr-2">
              <n-switch v-model:value="isStriped" @update:value="setStriped" />
            </div>
          </template>
          <span>表格斑马纹</span>
        </n-tooltip>
        <n-divider vertical />

        <!--刷新-->
        <n-tooltip trigger="hover">
          <template #trigger>
            <div class="table-toolbar-right-icon" @click="reload">
              <n-icon size="18">
                <ReloadOutlined />
              </n-icon>
            </div>
          </template>
          <span>刷新</span>
        </n-tooltip>

        <!--密度-->
        <n-tooltip trigger="hover">
          <template #trigger>
            <div class="table-toolbar-right-icon">
              <n-dropdown
                v-model:value="tableSize"
                :options="densityOptions"
                trigger="click"
                @select="densitySelect"
              >
                <n-icon size="18">
                  <ColumnHeightOutlined />
                </n-icon>
              </n-dropdown>
            </div>
          </template>
          <span>密度</span>
        </n-tooltip>

        <!--表格设置单独抽离成组件-->
        <ColumnSetting />
      </template>
    </div>
  </div>
  <div class="s-table">
    <n-data-table
      ref="tableElRef"
      v-bind="getBindValues"
      :pagination="pagination"
      :striped="isStriped"
      @update:page="updatePage"
      @update:page-size="updatePageSize"
    >
      <template v-for="item in Object.keys($slots)" :key="item" #[item]="data">
        <slot :name="item" v-bind="data"></slot>
      </template>
    </n-data-table>
  </div>
</template>

<script lang="ts" setup>
import { ColumnHeightOutlined, QuestionCircleOutlined, ReloadOutlined } from '@vicons/antd'
import { computed, nextTick, onMounted, ref, toRaw, unref } from 'vue'
import { createTableContext } from './hooks/useTableContext'

import ColumnSetting from './components/settings/ColumnSetting.vue'

import { useColumns } from './hooks/useColumns'
import { useDataSource } from './hooks/useDataSource'
import { useLoading } from './hooks/useLoading'
import { usePagination } from './hooks/usePagination'

import { basicProps } from './props'

import type { BasicTableProps } from './types/table'

import { useWindowSizeFn } from '@/hooks/event/useWindowSizeFn'
import { getViewportOffset } from '@/utils/domUtils'
import { isBoolean } from '@/utils/is'

const densityOptions = [
  {
    type: 'menu',
    label: '紧凑',
    key: 'small',
  },
  {
    type: 'menu',
    label: '默认',
    key: 'medium',
  },
  {
    type: 'menu',
    label: '宽松',
    key: 'large',
  },
]

const emit = defineEmits([
  'fetch-success',
  'fetch-error',
  'update:checked-row-keys',
  'edit-end',
  'edit-cancel',
  'edit-row-end',
  'edit-change',
])

const props = defineProps({ ...basicProps })
const deviceHeight = ref(150)
const tableElRef = ref<ComponentRef>(null)
const wrapRef = ref<Nullable<HTMLDivElement>>(null)
let paginationEl: HTMLElement | null
const isStriped = ref(props.striped || false)
const tableData = ref<Recordable[]>([])
const innerPropsRef = ref<Partial<BasicTableProps>>()

const getProps = computed(() => {
  return { ...props, ...unref(innerPropsRef) } as BasicTableProps
})

const tableSize = ref(unref(getProps as any).size || 'medium')

const { getLoading, setLoading } = useLoading(getProps)

const { getPaginationInfo, setPagination } = usePagination(getProps)

const { getDataSourceRef, getDataSource, getRowKey, reload } = useDataSource(
  getProps,
  {
    getPaginationInfo,
    setPagination,
    tableData,
    setLoading,
  },
  emit,
)

const { getPageColumns, setColumns, getColumns, getCacheColumns, setCacheColumnsField } =
  useColumns(getProps)

//页码切换
function updatePage(page) {
  setPagination({ page: page })
  reload()
}

//分页数量切换
function updatePageSize(size) {
  setPagination({ page: 1, pageSize: size })
  reload()
}

//密度切换
function densitySelect(e) {
  tableSize.value = e
}

//获取表格大小
const getTableSize = computed(() => tableSize.value)

//组装表格信息
const getBindValues = computed(() => {
  const tableData = unref(getDataSourceRef)
  const maxHeight = tableData.length ? `${unref(deviceHeight)}px` : 'auto'
  return {
    ...unref(getProps),
    loading: unref(getLoading),
    columns: toRaw(unref(getPageColumns)),
    rowKey: unref(getRowKey),
    data: tableData,
    size: unref(getTableSize),
    remote: true,
    'max-height': maxHeight,
    title: '', // 重置为空 避免绑定到 table 上面
  }
})

//获取分页信息
const pagination = computed(() => toRaw(unref(getPaginationInfo)))

function setProps(props: Partial<BasicTableProps>) {
  innerPropsRef.value = { ...unref(innerPropsRef), ...props }
}

const setStriped = (value: boolean) => (isStriped.value = value)

const tableAction = {
  reload,
  setColumns,
  setLoading,
  setProps,
  getColumns,
  getDataSource,
  getPageColumns,
  getCacheColumns,
  setCacheColumnsField,
  emit,
}

const getCanResize = computed(() => {
  const { canResize } = unref(getProps)
  return canResize
})

async function computeTableHeight() {
  const table = unref(tableElRef)
  if (!table) return
  if (!unref(getCanResize)) return
  const tableEl: any = table?.$el
  const headEl = tableEl.querySelector('.n-data-table-thead ')
  const { bottomIncludeBody } = getViewportOffset(headEl)
  const headerH = 64
  let paginationH = 2
  const marginH = 24
  if (!isBoolean(unref(pagination))) {
    paginationEl = tableEl.querySelector('.n-data-table__pagination') as HTMLElement
    if (paginationEl) {
      const offsetHeight = paginationEl.offsetHeight
      paginationH += offsetHeight || 0
    } else {
      paginationH += 28
    }
  }
  let height =
    bottomIncludeBody - (headerH + paginationH + marginH + (props.resizeHeightOffset || 0))
  const maxHeight = props.maxHeight
  height = maxHeight && maxHeight < height ? maxHeight : height
  deviceHeight.value = height
}

useWindowSizeFn(computeTableHeight, 280)

onMounted(() => {
  nextTick(() => {
    computeTableHeight()
  })
})

createTableContext({ ...tableAction, wrapRef, getBindValues })

defineExpose(tableAction)
</script>
<style lang="less" scoped>
.table-toolbar {
  display: flex;
  justify-content: space-between;
  padding-bottom: 16px;

  &-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;

    &-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 16px;
      font-weight: 600;
    }
  }

  &-right {
    display: flex;
    justify-content: flex-end;
    flex: 1;

    &-icon {
      margin-left: 12px;
      font-size: 16px;
      cursor: pointer;
      color: var(--text-color);

      :hover {
        color: #1890ff;
      }
    }
  }
}

.table-toolbar-inner-popover-title {
  padding: 2px 0;
}
</style>
