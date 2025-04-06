import { useLayoutStore } from '@/store/modules/layout'
import { nextTick, onActivated, onDeactivated, ref } from 'vue'

export const useCollapsedOnActivated = () => {
  const layoutStore = useLayoutStore()

  const collapsed = ref(false)

  onActivated(async () => {
    // 缓存当前菜单折叠状态
    collapsed.value = layoutStore.collapsed
    nextTick(() => {
      // 激活时折叠菜单
      layoutStore.setCollapsed(true)
    })
  })

  onDeactivated(() => {
    // 离开时恢复菜单折叠状态
    layoutStore.setCollapsed(collapsed.value)
  })

  return { collapsed }
}
