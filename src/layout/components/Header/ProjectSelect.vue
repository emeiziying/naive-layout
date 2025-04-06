<template>
  <div class="w-40 overflow-hidden rounded-full">
    <NSelect
      :bordered="false"
      :options="projectOptions"
      size="large"
      :value="currentProject"
      @update:value="projectStore.handleProjectChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/store/modules/project'
import { NSelect } from 'naive-ui'
import { storeToRefs } from 'pinia'

const projectStore = useProjectStore()

const { projectOptions, currentProject } = storeToRefs(projectStore)
</script>

<style scoped></style>
