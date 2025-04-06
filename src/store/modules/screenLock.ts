import { IS_SCREENLOCKED } from '@/store/mutation-types'
import { storage } from '@/utils/Storage'
import { defineStore } from 'pinia'

// 长时间不操作默认锁屏时间
const initTime = 60 * 60

const isLocked = storage.get(IS_SCREENLOCKED, false)

export type IScreenLockState = {
  isLocked: boolean // 是否锁屏
  lockTime: number
}

export const useScreenLockStore = defineStore('app-screen-lock', {
  state: (): IScreenLockState => ({
    isLocked: isLocked === true, // 是否锁屏
    lockTime: isLocked == 'true' ? initTime : 0,
  }),
  getters: {},
  actions: {
    setLock(payload: boolean) {
      this.isLocked = payload
      storage.set(IS_SCREENLOCKED, this.isLocked)
    },
    setLockTime(payload = initTime) {
      this.lockTime = payload
    },
  },
})
