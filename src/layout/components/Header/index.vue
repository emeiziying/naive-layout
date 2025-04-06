<template>
  <div class="layout-header">
    <!--顶部菜单-->
    <div
      v-if="navMode === 'horizontal' || (navMode === 'horizontal-mix' && mixMenu)"
      class="layout-header-left"
    >
      <div v-if="navMode === 'horizontal'" class="logo">
        <img alt="" class="pointer-events-none" :src="websiteConfig.logo" />
        <h2 v-show="!collapsed" class="title">{{ websiteConfig.title }}</h2>
      </div>
      <AsideMenu
        v-model:location="getMenuLocation"
        :collapsed="collapsed"
        :inverted="getInverted"
        mode="horizontal"
      />
    </div>
    <!--左侧菜单-->
    <div v-else class="layout-header-left">
      <!-- 刷新 -->
      <div
        v-if="headerSetting.isReload"
        class="layout-header-trigger layout-header-trigger-min mr-1"
        @click="reloadPage"
      >
        <n-icon size="18">
          <ReloadOutlined />
        </n-icon>
      </div>
      <!-- 面包屑 -->
      <n-breadcrumb v-if="crumbsSetting.show" class="pl-4.5">
        <template
          v-for="routeItem in breadcrumbList"
          :key="routeItem.name === 'Redirect' ? void 0 : routeItem.name"
        >
          <n-breadcrumb-item v-if="routeItem.meta.title">
            <n-dropdown
              v-if="routeItem.children.length"
              :options="routeItem.children"
              @select="dropdownSelect"
            >
              <span class="link-text">
                <component
                  :is="routeItem.meta.icon"
                  v-if="crumbsSetting.showIcon && routeItem.meta.icon"
                />
                {{ routeItem.meta.title }}
              </span>
            </n-dropdown>
            <span v-else class="link-text">
              <component
                :is="routeItem.meta.icon"
                v-if="crumbsSetting.showIcon && routeItem.meta.icon"
              />
              {{ routeItem.meta.title }}
            </span>
          </n-breadcrumb-item>
        </template>
      </n-breadcrumb>
    </div>
    <div class="layout-header-right">
      <!-- 项目切换 -->
      <!-- <ProjectSelect /> -->

      <div
        class="ml-2.5 flex h-10 items-center rounded-full px-1.5"
        :style="{ backgroundColor: themeVar.inputColor }"
      >
        <div
          v-for="item in iconList"
          :key="item.icon"
          class="layout-header-trigger layout-header-trigger-min"
        >
          <n-tooltip placement="bottom">
            <template #trigger>
              <n-icon size="18">
                <component :is="item.icon" v-on="item.eventObject || {}" />
              </n-icon>
            </template>
            <span>{{ item.tips }}</span>
          </n-tooltip>
        </div>

        <!--切换全屏-->
        <div class="layout-header-trigger layout-header-trigger-min">
          <n-tooltip placement="bottom">
            <template #trigger>
              <n-icon size="18">
                <component :is="fullscreenIcon" @click="toggleFullScreen" />
              </n-icon>
            </template>
            <span>全屏</span>
          </n-tooltip>
        </div>

        <!-- 主题切换 -->
        <div class="dark-switch layout-header-trigger-min">
          <n-switch
            v-model:value="designStore.darkTheme"
            class="h-6.5"
            :style="{
              '--n-rail-color': themeVar.buttonColor2,
              '--n-rail-color-active': themeVar.buttonColor2,
            }"
            :theme-overrides="{ railHeightMedium: '26px', railWidthMedium: '52px' }"
          >
            <template #checked>
              <n-icon color="#ffd93b" size="14">
                <SunnySharp />
              </n-icon>
            </template>
            <template #unchecked>
              <n-icon color="#ffd93b" size="14">
                <Moon />
              </n-icon>
            </template>
          </n-switch>
        </div>

        <!-- 个人中心 -->
        <div class="layout-header-trigger layout-header-trigger-min">
          <n-dropdown :options="avatarOptions" trigger="hover" @select="avatarSelect">
            <div class="avatar">
              <n-avatar round :size="26" :src="avatar">
                <template #placeholder>
                  <UserOutlined />
                </template>
              </n-avatar>
            </div>
          </n-dropdown>
        </div>
        <!--设置-->
        <div
          v-if="true"
          class="layout-header-trigger layout-header-trigger-min"
          @click="openSetting"
        >
          <n-tooltip placement="bottom-end">
            <template #trigger>
              <n-icon size="18" style="font-weight: bold">
                <SettingOutlined />
              </n-icon>
            </template>
            <span>项目配置</span>
          </n-tooltip>
        </div>
      </div>
    </div>
  </div>
  <!--项目配置-->
  <ProjectSetting ref="drawerSetting" />
</template>

<script lang="ts">
import { websiteConfig } from '@/config/website.config'
import { PageEnum } from '@/enums/pageEnum'
import { useProjectSetting } from '@/hooks/setting/useProjectSetting'
import { AsideMenu } from '@/layout/components/Menu'
import { useDesignSettingStore } from '@/store/modules/designSetting'
import { useUserStore } from '@/store/modules/user'
import { TABS_ROUTES } from '@/store/mutation-types'
import { storage } from '@/utils/Storage'
import { Moon, SunnySharp } from '@vicons/ionicons5'
import { NDialogProvider, useDialog, useMessage, useThemeVars } from 'naive-ui'
import { computed, defineComponent, reactive, ref, toRefs, unref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import components from './components'
import ProjectSelect from './ProjectSelect.vue'
import ProjectSetting from './ProjectSetting.vue'

export default defineComponent({
  name: 'PageHeader',
  components: {
    ...components,
    NDialogProvider,
    ProjectSetting,
    AsideMenu,
    ProjectSelect,
    Moon,
    SunnySharp,
  },
  props: {
    collapsed: {
      type: Boolean,
    },
    inverted: {
      type: Boolean,
    },
  },
  emits: ['update:collapsed'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    const message = useMessage()
    const dialog = useDialog()
    const { navMode, navTheme, headerSetting, menuSetting, crumbsSetting } = useProjectSetting()
    const designStore = useDesignSettingStore()
    const themeVar = useThemeVars()

    const drawerSetting = ref()

    const state = reactive({
      username: userStore?.info?.nickName ?? '',
      avatar: userStore?.info?.avatar ?? '',
      fullscreenIcon: 'FullscreenOutlined',
      navMode,
      navTheme,
      headerSetting,
      crumbsSetting,
    })

    const getInverted = computed(() => {
      return ['light', 'header-dark'].includes(unref(navTheme)) ? props.inverted : !props.inverted
    })

    const mixMenu = computed(() => {
      return unref(menuSetting).mixMenu
    })

    const getChangeStyle = computed(() => {
      const { collapsed } = props
      const { minMenuWidth, menuWidth } = unref(menuSetting)
      return {
        left: collapsed ? `${minMenuWidth}px` : `${menuWidth}px`,
        width: `calc(100% - ${collapsed ? `${minMenuWidth}px` : `${menuWidth}px`})`,
      }
    })

    const getMenuLocation = computed(() => {
      return 'header'
    })

    const router = useRouter()
    const route = useRoute()

    const generator: any = (routerMap) => {
      return routerMap.map((item) => {
        const currentMenu = {
          ...item,
          label: item.meta.title,
          key: item.name,
          disabled: item.path === '/',
        }
        // 是否有子菜单，并递归处理
        if (item.children && item.children.length > 0) {
          // Recursion
          currentMenu.children = generator(item.children, currentMenu)
        }
        return currentMenu
      })
    }

    const breadcrumbList = computed(() => {
      return generator(route.matched)
    })

    const dropdownSelect = (key) => {
      router.push({ name: key })
    }

    // 刷新页面
    const reloadPage = () => {
      router.push({
        path: '/redirect' + unref(route).fullPath,
      })
    }

    // 退出登录
    const doLogout = () => {
      dialog.info({
        title: '提示',
        content: '您确定要退出登录吗',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          userStore.logout().then(() => {
            message.success('成功退出登录')
            // 移除标签页
            storage.remove(TABS_ROUTES)
            // router
            //   .replace({
            //     name: 'Login',
            //     query: {
            //       redirect: route.fullPath,
            //     },
            //   })
            //   .finally(() => location.reload())
            window.location.href = PageEnum.BASE_LOGIN
          })
        },
        onNegativeClick: () => {},
      })
    }

    // 切换全屏图标
    const toggleFullscreenIcon = () =>
      (state.fullscreenIcon =
        document.fullscreenElement !== null ? 'FullscreenExitOutlined' : 'FullscreenOutlined')

    // 监听全屏切换事件
    document.addEventListener('fullscreenchange', toggleFullscreenIcon)

    // 全屏切换
    const toggleFullScreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }

    // 图标列表
    const iconList: any[] = [
      // {
      //   icon: 'SearchOutlined',
      //   tips: '搜索',
      // },
      // {
      //   icon: 'GithubOutlined',
      //   tips: 'github',
      //   eventObject: {
      //     click: () => window.open('https://github.com/jekip/naive-ui-admin'),
      //   },
      // },
      // {
      //   icon: 'LockOutlined',
      //   tips: '锁屏',
      //   eventObject: {
      //     click: () => useLockscreen.setLock(true),
      //   },
      // },
    ]
    const avatarOptions = [
      {
        label: '个人设置',
        key: 1,
      },
      {
        label: '退出登录',
        key: 2,
      },
    ]

    //头像下拉菜单
    const avatarSelect = (key) => {
      switch (key) {
        case 1:
          router.push({ name: 'Setting' })
          break
        case 2:
          doLogout()
          break
      }
    }

    function openSetting() {
      const { openDrawer } = drawerSetting.value
      openDrawer()
    }

    function handleMenuCollapsed() {
      emit('update:collapsed', !props.collapsed)
    }

    return {
      ...toRefs(state),
      iconList,
      toggleFullScreen,
      doLogout,
      route,
      dropdownSelect,
      avatarOptions,
      getChangeStyle,
      avatarSelect,
      breadcrumbList,
      reloadPage,
      drawerSetting,
      openSetting,
      getInverted,
      getMenuLocation,
      mixMenu,
      websiteConfig,
      handleMenuCollapsed,
      designStore,
      themeVar,
    }
  },
})
</script>

<style lang="less" scoped>
.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  height: 64px;
  // box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
  transition: all 0.2s ease-in-out;
  width: 100%;
  z-index: 11;

  &-left {
    display: flex;
    align-items: center;

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64px;
      line-height: 64px;
      overflow: hidden;
      white-space: nowrap;
      padding-left: 10px;

      img {
        width: auto;
        height: 32px;
        margin-right: 10px;
      }

      .title {
        margin-bottom: 0;
      }
    }

    ::v-deep(.ant-breadcrumb span:last-child .link-text) {
      color: #515a6e;
    }

    .n-breadcrumb {
      display: inline-block;
    }

    &-menu {
      color: var(--text-color);
    }
  }

  &-right {
    display: flex;
    align-items: center;
    margin-right: 20px;

    .avatar {
      display: flex;
      align-items: center;
      height: 26px;
    }

    > * {
      cursor: pointer;
    }
  }

  &-trigger {
    display: inline-block;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    .n-icon {
      display: flex;
      align-items: center;
      height: 40px;
      line-height: 40px;
    }

    &:hover {
      background: hsla(0, 0%, 100%, 0.08);
    }

    .anticon {
      font-size: 16px;
      color: #515a6e;
    }
  }

  &-trigger-min {
    width: auto;
    padding: 0 6px;
  }
}

.layout-header-light {
  background: #fff;
  color: #515a6e;

  .n-icon {
    color: #515a6e;
  }

  .layout-header-left {
    ::v-deep(.n-breadcrumb .n-breadcrumb-item:last-child .n-breadcrumb-item__link) {
      color: #515a6e;
    }
  }

  .layout-header-trigger {
    &:hover {
      background: #f8f8f9;
    }
  }
}

.layout-header-fix {
  position: fixed;
  top: 0;
  right: 0;
  left: 200px;
  z-index: 11;
}

//::v-deep(.menu-router-link) {
//  color: #515a6e;
//
//  &:hover {
//    color: #1890ff;
//  }
//}

.dark-switch .n-switch {
  ::v-deep(.n-switch__rail) {
    // background-color: var(--color);
  }

  ::v-deep(.n-switch__rail-placeholder) {
    width: 52px;
  }
}
</style>
