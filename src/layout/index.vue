<template>
  <n-layout class="layout" has-sider :position="fixedMenu">
    <n-layout-sider
      v-if="
        !isMobile && isMixMenuNoneSub && (navMode === 'vertical' || navMode === 'horizontal-mix')
      "
      class="layout-sider"
      collapse-mode="width"
      :collapsed="collapsed"
      :collapsed-width="64"
      content-class="h-full flex flex-col justify-between"
      :inverted="inverted"
      :native-scrollbar="false"
      :position="fixedMenu"
      show-trigger="bar"
      :width="leftMenuWidth"
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div>
        <Logo :collapsed="collapsed" />
        <AsideMenu v-model:collapsed="collapsed" v-model:location="getMenuLocation" />
      </div>

      <!-- 菜单收起 -->
      <div
        class="flex h-12 items-center justify-center border-t-1"
        :style="{ borderColor: themeVar.borderColor }"
        @click="collapsed = !collapsed"
      >
        <n-icon v-if="collapsed" size="18">
          <MenuUnfoldOutlined />
        </n-icon>
        <n-icon v-else size="18">
          <MenuFoldOutlined />
        </n-icon>
      </div>
    </n-layout-sider>

    <n-drawer
      v-model:show="showSideDrawer"
      class="layout-side-drawer"
      :placement="'left'"
      :width="menuWidth"
    >
      <n-layout-sider
        class="layout-sider"
        :collapsed="false"
        :inverted="inverted"
        :native-scrollbar="false"
        :position="fixedMenu"
        :width="menuWidth"
      >
        <Logo :collapsed="collapsed" />
        <AsideMenu v-model:location="getMenuLocation" />
      </n-layout-sider>
    </n-drawer>

    <n-layout :inverted="inverted">
      <n-layout-header
        :class="{ 'layout-default-background': getDarkTheme === false }"
        :inverted="getHeaderInverted"
        :position="fixedHeader"
      >
        <PageHeader v-model:collapsed="collapsed" :inverted="inverted" />
      </n-layout-header>

      <n-layout-content
        class="layout-content"
        :class="{ 'layout-default-background': getDarkTheme === false }"
      >
        <div
          class="layout-content-main"
          :class="{
            'layout-content-main-fix': fixedMulti,
            'fluid-header': fixedHeader === 'static',
          }"
        >
          <TabsView v-if="isMultiTabs" v-model:collapsed="collapsed" />
          <div
            class="main-view"
            :class="{
              'main-view-fix': fixedMulti,
              noMultiTabs: !isMultiTabs,
              'mt-3': !isMultiTabs,
            }"
          >
            <MainView />
          </div>
        </div>
        <!--1.15废弃，没啥用，占用操作空间-->
        <!--        <NLayoutFooter v-if="getShowFooter">-->
        <!--          <PageFooter />-->
        <!--        </NLayoutFooter>-->
      </n-layout-content>
      <n-back-top :right="100" />
    </n-layout>
  </n-layout>
</template>

<script lang="ts" setup>
import { useDesignSetting } from '@/hooks/setting/useDesignSetting'
import { useProjectSetting } from '@/hooks/setting/useProjectSetting'
import { useLayoutStore } from '@/store/modules/layout'
import { useProjectSettingStore } from '@/store/modules/projectSetting'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@vicons/antd'
import { useThemeVars } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed, onMounted, unref } from 'vue'
import { useRoute } from 'vue-router'
import { PageHeader } from './components/Header'
import { Logo } from './components/Logo'
import { MainView } from './components/Main'
import { AsideMenu } from './components/Menu'
import { TabsView } from './components/TagsView'

const { getDarkTheme } = useDesignSetting()
const {
  // showFooter,
  navMode,
  navTheme,
  headerSetting,
  menuSetting,
  multiTabsSetting,
} = useProjectSetting()
const themeVar = useThemeVars()

const layoutStore = useLayoutStore()

const settingStore = useProjectSettingStore()

const { mobileWidth, menuWidth } = unref(menuSetting)

const { collapsed } = storeToRefs(layoutStore)

const isMobile = computed<boolean>({
  get: () => settingStore.getIsMobile,
  set: (val) => settingStore.setIsMobile(val),
})

const fixedHeader = computed(() => {
  const { fixed } = unref(headerSetting)
  return fixed ? 'absolute' : 'static'
})

const isMixMenuNoneSub = computed(() => {
  const mixMenu = unref(menuSetting).mixMenu
  const currentRoute = useRoute()
  if (unref(navMode) != 'horizontal-mix') return true
  if (unref(navMode) === 'horizontal-mix' && mixMenu && currentRoute.meta.isRoot) {
    return false
  }
  return true
})

const fixedMenu = computed(() => {
  const { fixed } = unref(headerSetting)
  return fixed ? 'absolute' : 'static'
})

const isMultiTabs = computed(() => {
  return unref(multiTabsSetting).show
})

const fixedMulti = computed(() => {
  return unref(multiTabsSetting).fixed
})

const inverted = computed(() => {
  return ['dark', 'header-dark'].includes(unref(navTheme))
})

const getHeaderInverted = computed(() => {
  return ['light', 'header-dark'].includes(unref(navTheme)) ? unref(inverted) : !unref(inverted)
})

const leftMenuWidth = computed(() => {
  const { minMenuWidth, menuWidth } = unref(menuSetting)
  return collapsed.value ? minMenuWidth : menuWidth
})

const getMenuLocation = computed(() => {
  return 'left'
})

// 控制显示或隐藏移动端侧边栏
const showSideDrawer = computed({
  get: () => isMobile.value && collapsed.value,
  set: (val) => {
    layoutStore.setCollapsed(val)
  },
})

//判断是否触发移动端模式
const checkMobileMode = () => {
  if (document.body.clientWidth <= mobileWidth) {
    isMobile.value = true
  } else {
    isMobile.value = false
  }
  layoutStore.setCollapsed(false)
}

const watchWidth = () => {
  const Width = document.body.clientWidth

  layoutStore.setCollapsed(Width <= 950)

  checkMobileMode()
}

onMounted(() => {
  checkMobileMode()
  window.addEventListener('resize', watchWidth)
})
</script>

<style lang="less">
.layout-side-drawer {
  background-color: #001428;

  .layout-sider {
    min-height: 100vh;
    box-shadow: 2px 0 8px 0 rgb(29 35 41 / 5%);
    position: relative;
    z-index: 13;
    transition: all 0.2s ease-in-out;
  }
}
</style>
<style lang="less" scoped>
.layout {
  display: flex;
  flex-direction: row;
  flex: auto;

  &-default-background {
    background: #fafafc;
  }

  .layout-sider {
    min-height: 100vh;
    box-shadow: 2px 0 8px 0 rgb(29 35 41 / 5%);
    position: relative;
    z-index: 13;
    transition: all 0.2s ease-in-out;
  }

  .layout-sider-fix {
    position: fixed;
    top: 0;
    left: 0;
  }

  .ant-layout {
    overflow: hidden;
  }

  .layout-right-fix {
    overflow-x: hidden;
    padding-left: 200px;
    min-height: 100vh;
    transition: all 0.2s ease-in-out;
  }

  .layout-content {
    flex: auto;
    min-height: 100vh;
  }

  .n-layout-header.n-layout-header--absolute-positioned {
    z-index: 11;
  }

  .n-layout-footer {
    background: none;
  }
}

.layout-content-main {
  margin: 0 10px 10px;
  position: relative;
  padding-top: 64px;
}

.layout-content-main-fix {
  padding-top: 64px;
}

.fluid-header {
  padding-top: 0;
}

.main-view-fix {
  padding-top: 44px;
}

.noMultiTabs {
  padding-top: 0;
}
</style>
