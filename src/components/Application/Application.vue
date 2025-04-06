<template>
  <n-dialog-provider>
    <n-notification-provider>
      <n-message-provider :max="1">
        <slot name="default"></slot>
      </n-message-provider>
    </n-notification-provider>
  </n-dialog-provider>
</template>

<script lang="ts">
import { NDialogProvider, NMessageProvider, NNotificationProvider } from 'naive-ui'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Application',
  components: {
    NDialogProvider,
    NNotificationProvider,
    NMessageProvider,
  },
  setup() {
    return {}
  },
})
</script>
