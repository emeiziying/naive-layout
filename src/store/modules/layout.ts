import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
  const collapsed = ref<boolean>(false);

  const setCollapsed = (value: boolean) => {
    collapsed.value = value;
  };

  return {
    collapsed,
    setCollapsed,
  };
});
