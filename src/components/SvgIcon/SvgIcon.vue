<template>
  <div v-html="svgContent"></div>
</template>

<script lang="ts" setup>
import { alovaInstance } from '@/utils/http/alova'
import { onMounted, ref } from 'vue'

const props = defineProps<{ url: string }>()

const svgContent = ref('')

onMounted(() => {
  props.url &&
    alovaInstance.Get(props.url).then(async (res: any) => {
      const _svgContent =
        res.status === 200 && typeof res.data === 'string'
          ? res.data
          : '<svg  class="menu-svg" width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="页面-2" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="浅色" transform="translate(-20, -101)" fill-rule="nonzero" stroke="#4B4E52"><g id="编组-54" transform="translate(0, 84)"> <g id="icon_my_a" transform="translate(20, 17)"><path d="M2.06270429,5.71745152 C1.93284751,5.35734072 1.9977759,4.92520776 2.32241786,4.70914127 L8.16597302,1.10803324 C8.36075819,0.96398892 8.62047175,0.96398892 8.81525692,1.10803324 L14.6588121,4.70914127 C14.9185256,4.8531856 15.0483824,5.2132964 14.983454,5.50138504 C14.9185256,5.78947368 14.5938837,6.07756233 14.3341701,6.07756233 L14.3341701,13.2797784 C14.3341701,13.7119114 14.0744566,14 13.6848862,14 L3.29634372,14 C2.90677337,14 2.64705981,13.7119114 2.64705981,13.2797784 L2.64705981,6.07756233 C2.45227464,6.07756233 2.19256108,5.93351801 2.06270429,5.71745152 Z M7.19204716,11.6309854 L9.78918278,11.6309854 L9.78918278,8.02987732 L7.19204716,8.02987732 L7.19204716,11.6309854 Z" id="形状"></path></g></g></g></g></svg>'

      svgContent.value = modifyPathInSvg(_svgContent, 'custom-path')
    })
})

function modifyPathInSvg(svgString: string, className: string): string {
  // 定义正则表达式来匹配 <path> 标签
  const pathRegex = /<path([^>]*)>/g

  // 使用 replace 方法来替换匹配到的 <path> 标签
  const modifiedSvg = svgString.replace(pathRegex, (match, attributes) => {
    // 确保不重复添加 class 属性
    let newAttributes = attributes
    if (!newAttributes.includes('class="')) {
      newAttributes = ` class="${className}"${newAttributes}`
    }

    return `<path${newAttributes}>`
  })

  return modifiedSvg
}
</script>
<style lang="scss" scoped></style>
