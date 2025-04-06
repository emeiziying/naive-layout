import designSetting from '@/settings/designSetting'
import { store } from '@/store'
import { defineStore } from 'pinia'

const { darkTheme, appTheme, appThemeList } = designSetting

interface DesignSettingState {
  //深色主题
  darkTheme: boolean
  //系统风格
  appTheme: string
  //系统内置风格
  appThemeList: string[]
}

export const useDesignSettingStore = defineStore('app-design-setting', {
  state: (): DesignSettingState => ({
    darkTheme,
    appTheme,
    appThemeList,
  }),
  getters: {
    getDarkTheme(): boolean {
      return this.darkTheme
    },
    getAppTheme(): string {
      return this.appTheme
    },
    getAppThemeList(): string[] {
      return this.appThemeList
    },
  },
  actions: {},
})

// Need to be used outside the setup
export function useDesignSetting() {
  return useDesignSettingStore(store)
}
