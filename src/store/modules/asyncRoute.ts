import type { SysMenuDo } from '@/api/system/globals'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import { useProjectSetting } from '@/hooks/setting/useProjectSetting'
import { generateDynamicRoutes } from '@/router/generator'
import { asyncRoutes, constantRouter } from '@/router/index'
import { store } from '@/store'
import { defineStore } from 'pinia'
import { h, toRaw, unref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

interface TreeHelperConfig {
  id: string
  children: string
  pid: string
}

const DEFAULT_CONFIG: TreeHelperConfig = {
  id: 'id',
  children: 'children',
  pid: 'pid',
}

const getConfig = (config: Partial<TreeHelperConfig>) => Object.assign({}, DEFAULT_CONFIG, config)

export interface IAsyncRouteState {
  menus: RouteRecordRaw[]
  routers: any[]
  routersAdded: any[]
  keepAliveComponents: string[]
  isDynamicRouteAdded: boolean
}

function filter<T = any>(
  tree: T[],
  func: (n: T) => boolean,
  config: Partial<TreeHelperConfig> = {},
): T[] {
  config = getConfig(config)
  const children = config.children as string

  function listFilter(list: T[]) {
    return list
      .map((node: any) => ({ ...node }))
      .filter((node) => {
        node[children] = node[children] && listFilter(node[children])
        return func(node) || (node[children] && node[children].length)
      })
  }

  return listFilter(tree)
}

export const useAsyncRouteStore = defineStore('app-async-route', {
  state: (): IAsyncRouteState => ({
    menus: [],
    routers: constantRouter,
    routersAdded: [],
    keepAliveComponents: [],
    // Whether the route has been dynamically added
    isDynamicRouteAdded: false,
  }),
  getters: {
    getMenus(): RouteRecordRaw[] {
      return this.menus
    },
    getIsDynamicRouteAdded(): boolean {
      return this.isDynamicRouteAdded
    },
  },
  actions: {
    getRouters() {
      return toRaw(this.routersAdded)
    },
    setDynamicRouteAdded(added: boolean) {
      this.isDynamicRouteAdded = added
    },
    // 设置动态路由
    setRouters(routers: RouteRecordRaw[]) {
      this.routersAdded = routers
      this.routers = constantRouter.concat(routers)
    },
    setMenus(menus: RouteRecordRaw[]) {
      // 设置动态路由
      this.menus = menus
    },
    setKeepAliveComponents(compNames: string[]) {
      // 设置需要缓存的组件
      this.keepAliveComponents = compNames
    },
    async generateRoutes(data) {
      let accessedRouters
      const { permissions: permissionsList = [], menuList = [] } = data
      const routeFilter = (route) => {
        const { meta } = route
        const { permissions } = meta || {}
        if (!permissions) return true
        return permissionsList.some((item) => permissions.includes(item))
      }

      const { permissionMode } = useProjectSetting()
      if (unref(permissionMode) === 'BACK') {
        // 动态获取菜单
        try {
          accessedRouters = await generateDynamicRoutes()
        } catch (error) {
          console.log(error)
        }
      } else {
        try {
          //过滤账户是否拥有某一个权限，并将菜单从加载列表移除
          accessedRouters = filter(asyncRoutes, routeFilter)
        } catch (error) {
          console.log(error)
        }
      }
      accessedRouters = accessedRouters.filter(routeFilter)
      this.setRouters(accessedRouters)

      // 将菜单列表转换为路由列表
      function transformMenuList(menuList: SysMenuDo[]): RouteRecordRaw[] {
        return menuList.map((item) => {
          const transformedItem: any = {
            name: item.path,
            path: item.path ?? '',
            meta: {
              title: item.menuName,
              sort: item.orderNum,
              icon: item.icon ? () => h(SvgIcon, { url: item.icon! }) : undefined,
            },
          }

          if (item.children && item.children.length > 0) {
            transformedItem.children = transformMenuList(item.children)
          }
          return transformedItem
        })
      }

      this.setMenus(transformMenuList(menuList))

      return toRaw(accessedRouters)
    },
  },
})

// Need to be used outside the setup
export function useAsyncRoute() {
  return useAsyncRouteStore(store)
}
