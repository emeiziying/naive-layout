// https://alova.js.org/zh-CN/tutorial/getting-started/extension-integration#%E9%85%8D%E7%BD%AE
import type { Config } from '@alova/wormhole/typings'

const config: Config = {
  generator: [
    {
      input: 'http://10.197.210.65:8880/api/auth/v3/api-docs',
      platform: 'swagger',
      output: 'src/api/auth',
      global: 'Auth',
      useImportType: true,
      handleApi: (apiDescriptor) => {
        apiDescriptor.url = `/auth${apiDescriptor.url}`
        return apiDescriptor
      },
    },
    {
      input: 'http://10.197.210.65:8880/api/system/v3/api-docs',
      platform: 'swagger',
      output: 'src/api/system',
      global: 'System',
      useImportType: true,
      handleApi: (apiDescriptor) => {
        apiDescriptor.url = `/system${apiDescriptor.url}`
        const whiteList = ['getInitInfo']
        if (apiDescriptor.operationId && whiteList.includes(apiDescriptor.operationId)) {
          return apiDescriptor
        }
      },
    },
  ],

  autoUpdate: {
    launchEditor: true,
    interval: 5 * 60 * 1000,
  },
}

export default config
