import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProjectStore = defineStore('project', () => {
  const currentProject = ref<number>()
  const projectOptions = ref<{ label: string; value: number }[]>([])

  const loadProjectOptions = async () => {
    const { data } = await EtData.general.etDataProjectUserSelectList({
      params: {
        // a: [1, 2],
        // b: [{ a: 1 }, { b: 2 }],
      },
    })

    projectOptions.value =
      data
        ?.map((e) => ({ label: e.label ?? '', value: e.value ?? 0 }))
        .filter((e) => e.label && e.value !== undefined) ?? []

    currentProject.value = projectOptions.value[0]?.value
  }

  const handleProjectChange = (value: number) => {
    currentProject.value = value
  }

  return { currentProject, projectOptions, loadProjectOptions, handleProjectChange }
})
