import { useTabsViewStore, type RouteItem } from '@/store/modules/tabsView'
import { useRoute, useRouter } from 'vue-router'

export const useCurrentTab = () => {
  const tabsViewStore = useTabsViewStore()
  const route = useRoute()
  const router = useRouter()

  const close = () => {
    tabsViewStore.closeCurrentTab(route as RouteItem)
  }

  const back = () => {
    close()
    router.back()
  }

  return {
    close,
    back,
  }
}
