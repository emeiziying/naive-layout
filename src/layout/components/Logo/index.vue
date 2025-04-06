<template>
  <div class="logo">
    <img
      alt=""
      class="pointer-events-none"
      :class="{ 'mr-2': !collapsed }"
      :src="websiteConfig.logo"
    />
    <h2 v-show="!collapsed" class="title font-bold">{{ websiteConfig.title }}</h2>
  </div>
</template>

<script lang="ts">
import { websiteConfig } from '@/config/website.config'
export default {
  name: 'Index',
  props: {
    collapsed: {
      type: Boolean,
    },
  },
  data() {
    return {
      websiteConfig,
    }
  },
}
</script>

<style lang="less" scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  line-height: 64px;
  overflow: hidden;
  white-space: nowrap;

  background: url('@/assets/images/logo-bg.png') no-repeat center center;
  background-size: 100% 100%;

  img {
    width: auto;
    height: 32px;
  }

  .title {
    margin: 0;
  }
}
</style>
