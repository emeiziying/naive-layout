import { ResultEnum } from '@/enums/httpEnum'
import { store } from '@/store'
import { CURRENT_USER } from '@/store/mutation-types'
import { defineStore } from 'pinia'

import type { BaseUserVo } from '@/api/system/globals'
import { useGlobSetting } from '@/hooks/setting'
import { storage } from '@/utils/Storage'
import { getToken, setToken } from '@/utils/token'

export interface IUserState {
  token: string
  welcome: string
  permissions: string[]
  info: BaseUserVo
}

export const useUserStore = defineStore('app-user', {
  state: (): IUserState => ({
    token: getToken(),
    welcome: '',
    permissions: [],
    info: storage.get(CURRENT_USER, {}),
  }),
  getters: {
    getToken(): string {
      return this.token
    },
    getAvatar(): string {
      return this.info.avatar ?? ''
    },
    getNickname(): string {
      return this.info.nickName ?? ''
    },
    getPermissions(): string[] {
      return this.permissions
    },
    getUserInfo(): BaseUserVo {
      return this.info
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token
    },
    setPermissions(permissions) {
      this.permissions = permissions
    },
    setUserInfo(info: BaseUserVo) {
      this.info = info
    },
    // 登录
    async login(params: Parameters<typeof Auth.general.login>[0]) {
      const response = await Auth.general.login(params)
      const { data, code } = response
      const { accessToken } = data ?? {}

      if (code === ResultEnum.SUCCESS && accessToken) {
        setToken(accessToken)
        this.setToken(accessToken)
      }
      return response
    },

    // 获取用户信息
    async getInfo() {
      const { appId } = useGlobSetting()
      const { data } = await System.general.getInitInfo({ params: { appId } })

      const { userInfo, roleList = [], menuList = [], appInfo } = data ?? {}

      if (userInfo) {
        storage.set(CURRENT_USER, userInfo)
        this.setUserInfo(userInfo)
      }

      if (roleList) {
        this.setPermissions(roleList)
      } else {
        throw new Error('getInfo: permissionsList must be a non-null array !')
      }
      // this.setAvatar(result.avatar);
      return { permissions: roleList, menuList, appInfo }
    },

    // 登出
    async logout() {
      await Auth.general.logout({ params: {} })

      this.setPermissions([])
      this.setUserInfo({})
      // storage.remove(ACCESS_TOKEN)
      storage.remove(CURRENT_USER)
    },
  },
})

// Need to be used outside the setup
export function useUser() {
  return useUserStore(store)
}
