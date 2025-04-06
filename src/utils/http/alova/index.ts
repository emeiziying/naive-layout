import { ContentTypeEnum, ResultEnum } from '@/enums/httpEnum'
import { PageEnum } from '@/enums/pageEnum'
import { useGlobSetting } from '@/hooks/setting'
import { isUrl } from '@/utils'
import { getToken } from '@/utils/token'
import { axiosRequestAdapter } from '@alova/adapter-axios'
import { createAlovaMockAdapter } from '@alova/mock'
import { hmacSHA256, objKeySortNew } from '@boe/utils-es'
import { createAlova } from 'alova'
import VueHook from 'alova/vue'
import axios from 'axios'
import qs from 'qs'

const { useMock, apiUrl, urlPrefix, loggerMock, appId } = useGlobSetting()
const apiSignKey = import.meta.env.VITE_API_SIGN_KEY

const getSign = (data: Record<string, any>, key: string) => {
  const str = qs.stringify(data, { allowDots: true })

  const obj = decodeURIComponent(str)
    .split('&')
    .reduce((acc, item) => {
      const [key, value] = item.split('=')
      acc[key] = value
      return acc
    }, {})

  const sorts = objKeySortNew(obj)
  const sha256 = hmacSHA256(sorts, key)

  return encodeURIComponent(sha256)
}
const globalFetch = axiosRequestAdapter({
  axios: axios.create({
    paramsSerializer: (data) => qs.stringify(data, { allowDots: true }),
    transformRequest: [
      (data, headers) => {
        if (headers['Content-Type'] === ContentTypeEnum.FORM_URLENCODED) {
          return qs.stringify(data, { allowDots: true })
        }
        return data
      },
    ],
  }),
})

let requestAdapter = globalFetch

if (import.meta.env.DEV) {
  const mocks = await import('./mocks')
  requestAdapter = createAlovaMockAdapter([...mocks.default], {
    // 全局控制是否启用mock接口，默认为true
    enable: useMock,
    // 非模拟请求适配器，用于未匹配mock接口时发送请求
    httpAdapter: globalFetch,
    // mock接口响应延迟，单位毫秒
    delay: 1000,
    // 自定义打印mock接口请求信息
    // mockRequestLogger: (res) => {
    //   loggerMock && console.log(`Mock Request ${res.url}`, res);
    // },
    mockRequestLogger: loggerMock,
    onMockError(error, currentMethod) {
      console.error('🚀 ~ onMockError ~ currentMethod:', currentMethod)
      console.error('🚀 ~ onMockError ~ error:', error)
    },
  })
}

export const Alova = createAlova({
  baseURL: apiUrl,
  statesHook: VueHook,
  timeout: 15000,
  // 关闭全局请求缓存
  cacheFor: null,
  // 全局缓存配置
  // cacheFor: {
  //   POST: {
  //     mode: 'memory',
  //     expire: 60 * 10 * 1000
  //   },
  //   GET: {
  //     mode: 'memory',
  //     expire: 60 * 10 * 1000
  //   },
  //   HEAD: 60 * 10 * 1000 // 统一设置HEAD请求的缓存模式
  // },
  // 在开发环境开启缓存命中日志
  cacheLogger: import.meta.env.DEV,
  requestAdapter,
  beforeRequest(method) {
    // const userStore = useUser();
    const token = getToken()
    // 添加 token 到请求头
    if (!method.meta?.ignoreToken && token) {
      method.config.headers['Authorization'] = token
    }
    // 处理 api 请求前缀
    const isUrlStr = isUrl(method.url as string)
    if (!isUrlStr && urlPrefix) {
      method.url = `${urlPrefix}${method.url}`
    }

    // 处理请求头, 如果请求头中没有Content-Type，则设置为application/x-www-form-urlencoded;charset=UTF-8
    method.config.headers['Content-Type'] =
      method.config?.headers?.['Content-Type'] || ContentTypeEnum.FORM_URLENCODED
    method.config.headers['APP-ID'] = appId
    // method.config.headers['PROJECT_ID'] = useProjectStore().currentProject

    const { type, data = {}, config } = method
    if (type === 'GET' || type === 'HEAD') {
      Object.assign(config.params, {
        sign: getSign(config.params, apiSignKey),
      })
    } else if (type === 'POST' || type === 'PUT' || type === 'DELETE' || type === 'PATCH') {
      // 添加签名
      if (data instanceof FormData) {
        const _data = {}

        Object.keys(config.params).forEach((key) => {
          // _data[key] = config.params[key]
          data.append(key, config.params[key])
        })
        data.forEach((value, label) => {
          // 过滤文件类型
          if (!(value instanceof File)) {
            _data[label] = value
          }
        })
        data.append('sign', getSign(_data, apiSignKey))
      } else {
        method.data = Object.assign({}, data, config.params)
        Object.assign(method.data, { sign: getSign(method.data as any, apiSignKey) })
      }

      method.config.params = {}
      delete method.config['data']
    }
  },
  responded: {
    onSuccess: async (response, method) => {
      const res = response.data

      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const fileName = contentDisposition.split('filename=')[1]
        if (fileName) {
          // 获取文件类型
          const contentType = response.headers['content-type'] || 'application/octet-stream'
          // 创建 Blob 对象
          const blob = new Blob([res], { type: contentType })
          // 创建下载链接
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          // 解码文件名，处理中文文件名
          link.download = decodeURIComponent(fileName.replace(/["']/g, ''))
          link.click()
          // 清理
          window.URL.revokeObjectURL(url)
          return
        }
      }

      // 是否返回原生响应头 比如：需要获取响应头时使用该属性
      if (method.meta?.isReturnNativeResponse) {
        return res
      }
      // 请根据自身情况修改数据结构
      const { msg, code } = res

      // 不进行任何处理，直接返回
      // 用于需要直接获取 code、result、 message 这些信息时开启
      if (method.meta?.isTransformResponse === false) {
        return res
      }

      // @ts-ignore
      const Message = window.$message
      // @ts-ignore
      const Modal = window.$dialog

      const LoginPath = PageEnum.BASE_LOGIN
      if (ResultEnum.SUCCESS === code) {
        return res
      }
      // 需要登录
      if (code === 999) {
        Modal?.warning({
          title: '提示',
          content: '登录身份已失效，请重新登录!',
          closable: false,
          closeOnEsc: false,
          maskClosable: false,
          positiveText: '确定',
          onPositiveClick: async () => {
            // storage.clear()
            window.location.href = LoginPath
          },
        })
        throw new Error(msg)
      } else {
        // 可按需处理错误 一般情况下不是 912 错误，不一定需要弹出 message
        Message?.error(msg)
        throw new Error(msg)
      }
    },
  },
})

export const alovaInstance = createAlova({
  statesHook: VueHook,
  requestAdapter: globalFetch,
})
