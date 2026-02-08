<script setup lang="ts">
import { ref } from 'vue'

const container = ref<HTMLElement | null>(null)
const position = ref(50)

// skew angle in percentage offset (top vs bottom)
const skew = 8
// small overlap to avoid anti-alias seam between two layers
const overlap = 0.35

function onMouseMove(e: MouseEvent) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  position.value = Math.min(Math.max(x, 0), 100)
}

function clipLight() {
  const left = position.value - skew / 2 + overlap
  const right = position.value + skew / 2 + overlap
  return `polygon(0 0, ${right}% 0, ${left}% 100%, 0 100%)`
}
</script>

<template>
  <div
    ref="container"
    class="image-compare"
    @mousemove="onMouseMove"
  >
    <img
      src="/screenshot-dark.png"
      alt="暗色主题截图"
      class="image-compare__img"
      draggable="false"
    />
    <img
      src="/screenshot-light.png"
      alt="亮色主题截图"
      class="image-compare__img image-compare__overlay"
      :style="{ clipPath: clipLight() }"
      draggable="false"
    />
  </div>
</template>

<style scoped>
.image-compare {
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 32px auto 0;
  border-radius: 14px;
  overflow: hidden;
  cursor: ew-resize;
  user-select: none;
  touch-action: none;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  aspect-ratio: auto;
}

.image-compare__img {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.image-compare__overlay {
  position: absolute;
  top: 0;
  left: 0;
}

@media (max-width: 768px) {
  .image-compare {
    margin: 20px auto 0;
    border-radius: 10px;
  }
}
</style>
