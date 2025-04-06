<template>
  <RouterView>
    <template #default="{ Component, route }">
      <template v-if="mode === 'production'">
        <transition appear mode="out-in" :name="getTransitionName">
          <div>
            <keep-alive v-if="keepAliveComponents.length" :include="keepAliveComponents">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
            <component :is="Component" v-else :key="route.fullPath" />
          </div>
        </transition>
      </template>
      <template v-else>
        <keep-alive v-if="keepAliveComponents.length" :include="keepAliveComponents">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
        <component :is="Component" v-else :key="route.fullPath" />
      </template>
    </template>
  </RouterView>
</template>

<script lang="ts">
import { useProjectSetting } from '@/hooks/setting/useProjectSetting'
import { useAsyncRouteStore } from '@/store/modules/asyncRoute'
import { computed, defineComponent, unref } from 'vue'

export default defineComponent({
  name: 'MainView',
  components: {},
  props: {
    notNeedKey: {
      type: Boolean,
      default: false,
    },
    animate: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const { isPageAnimate, pageAnimateType } = useProjectSetting()
    const asyncRouteStore = useAsyncRouteStore()
    // 需要缓存的路由组件
    const keepAliveComponents = computed(() => asyncRouteStore.keepAliveComponents)

    const getTransitionName = computed(() => {
      return unref(isPageAnimate) ? unref(pageAnimateType) : ''
    })

    const mode = import.meta.env.MODE
    return {
      keepAliveComponents,
      getTransitionName,
      mode,
    }
  },
})
</script>

<style lang="less" scoped></style>
