<template>
  <div class="tableAction">
    <div class="flex items-center justify-center">
      <template v-for="(action, index) in getActions" :key="`${index}-${action.label}`">
        <NPopconfirm
          v-if="action.popConfirm"
          :negative-text="action.cancelText"
          :positive-text="action.okText"
          @negative-click="action.cancel"
          @positive-click="action.confirm"
        >
          <template #trigger>
            <n-button v-bind="action" class="mx-1">
              {{ action.label }}
              <template v-if="action.hasOwnProperty('icon')" #icon>
                <n-icon :component="action.icon" />
              </template>
            </n-button>
          </template>
          {{ action.title }}
        </NPopconfirm>

        <n-button v-else v-bind="action" class="mx-1">
          {{ action.label }}
          <template v-if="action.hasOwnProperty('icon')" #icon>
            <n-icon :component="action.icon" />
          </template>
        </n-button>
        <n-divider v-if="action.divider" vertical />
      </template>
      <n-dropdown
        v-if="dropDownActions && getDropdownList.length"
        :options="getDropdownList"
        trigger="hover"
        @select="select"
      >
        <slot name="more"></slot>
        <n-button v-if="!$slots.more" v-bind="getMoreProps" class="mx-1" icon-placement="right">
          <div class="flex items-center">
            <span>更多</span>
            <n-icon class="ml-1" size="14">
              <DownOutlined />
            </n-icon>
          </div>
          <!--          <template #icon>-->
          <!--            -->
          <!--          </template>-->
        </n-button>
      </n-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import type { ActionItem } from '@/components/Table'
import { usePermission } from '@/hooks/web/usePermission'
import { isBoolean, isFunction } from '@/utils/is'
import { DownOutlined } from '@vicons/antd'
import { NPopconfirm } from 'naive-ui'
import type { Size, Type } from 'naive-ui/es/button/src/interface'
import type { PropType } from 'vue'
import { computed, defineComponent, toRaw } from 'vue'

export default defineComponent({
  name: 'TableAction',
  components: { DownOutlined, NPopconfirm },
  props: {
    actions: {
      type: Array as PropType<ActionItem[]>,
      required: true,
    },
    dropDownActions: {
      type: Array as PropType<ActionItem[]>,
      default: null,
    },
    style: {
      type: String as PropType<string>,
      default: 'button',
    },
    select: {
      type: Function as PropType<Function>,
      default: () => {},
    },
  },
  setup(props) {
    const { hasPermission } = usePermission()

    const actionType: Type =
      props.style === 'button' ? 'default' : props.style === 'text' ? 'primary' : 'default'
    const actionText =
      props.style === 'button' ? undefined : props.style === 'text' ? true : undefined

    const getMoreProps = computed(() => {
      return {
        text: actionText,
        type: actionType,
        size: 'small' as Size,
      }
    })

    const getDropdownList = computed(() => {
      return (toRaw(props.dropDownActions) || [])
        .filter((action) => {
          return hasPermission(action.auth as string[]) && isIfShow(action)
        })
        .map((action) => {
          const { popConfirm } = action
          return {
            size: 'small' as Size,
            text: actionText,
            type: actionType,
            ...action,
            ...popConfirm,
            onConfirm: popConfirm?.confirm,
            onCancel: popConfirm?.cancel,
          }
        })
    })

    function isIfShow(action: ActionItem): boolean {
      const ifShow = action.ifShow

      let isIfShow = true

      if (isBoolean(ifShow)) {
        isIfShow = ifShow
      }
      if (isFunction(ifShow)) {
        isIfShow = ifShow(action)
      }
      return isIfShow
    }

    const getActions = computed(() => {
      return (toRaw(props.actions) || [])
        .filter((action) => {
          return hasPermission(action.auth as string[]) && isIfShow(action)
        })
        .map((action) => {
          const { popConfirm } = action
          //需要展示什么风格，自己修改一下参数
          return {
            size: 'small' as Size,
            text: actionText,
            type: actionType,
            quaternary: true,
            ...action,
            ...popConfirm,
            onConfirm: popConfirm?.confirm,
            onCancel: popConfirm?.cancel,
            enable: !!popConfirm,
          }
        })
    })

    return {
      getActions,
      getDropdownList,
      getMoreProps,
    }
  },
})
</script>
