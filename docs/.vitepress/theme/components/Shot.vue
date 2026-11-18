<script setup lang="ts">
import { withBase } from 'vitepress'

/**
 * 管理界面截图：同一张图有亮色、暗色两版，跟随站点主题显示其中一张。
 * 文件约定：/shots/<name>.light.webp 与 /shots/<name>.dark.webp
 */
const props = defineProps<{
  name: string
  alt: string
  caption?: string
}>()

const light = withBase(`/shots/${props.name}.light.webp`)
const dark = withBase(`/shots/${props.name}.dark.webp`)
</script>

<template>
  <figure class="shot">
    <img class="shot-img shot-light" :src="light" :alt="alt" loading="lazy" decoding="async" />
    <img class="shot-img shot-dark" :src="dark" :alt="alt" loading="lazy" decoding="async" />
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.shot {
  margin: 20px 0 24px;
}

.shot-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--eg-radius-inner);
  border: 1px solid var(--eg-border);
  box-shadow: var(--eg-shadow-raised);
  background: var(--eg-surface-2);
}

.shot-dark {
  display: none;
}

:global(.dark) .shot-light {
  display: none;
}

:global(.dark) .shot-dark {
  display: block;
}

figcaption {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  color: var(--vp-c-text-3);
}
</style>
