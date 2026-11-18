<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'

/**
 * 首屏产品截图：亮色 / 暗色两版叠放，拖动分隔线对比。
 * 支持鼠标、触摸（Pointer Events）与键盘（← →）。
 */
const props = withDefaults(defineProps<{ name?: string; alt?: string }>(), {
  name: 'overview',
  alt: '管理界面控制台',
})

const light = withBase(`/shots/${props.name}.light.webp`)
const dark = withBase(`/shots/${props.name}.dark.webp`)

const frame = ref<HTMLElement | null>(null)
const pos = ref(58)
let dragging = false

function setFrom(clientX: number) {
  const rect = frame.value?.getBoundingClientRect()
  if (!rect) return
  pos.value = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
}

function onDown(e: PointerEvent) {
  dragging = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  setFrom(e.clientX)
}

function onMove(e: PointerEvent) {
  if (dragging || e.pointerType === 'mouse') setFrom(e.clientX)
}

function onUp() {
  dragging = false
}

function onKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 10 : 4
  if (e.key === 'ArrowLeft') pos.value = Math.max(0, pos.value - step)
  else if (e.key === 'ArrowRight') pos.value = Math.min(100, pos.value + step)
  else return
  e.preventDefault()
}
</script>

<template>
  <div class="showcase">
    <div class="chrome" aria-hidden="true">
      <i /><i /><i />
      <span class="url">gateway.example.com/#/overview</span>
    </div>
    <div
      ref="frame"
      class="frame"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <img class="shot" :src="dark" :alt="`${alt}（暗色主题）`" draggable="false" fetchpriority="high" />
      <img
        class="shot top"
        :src="light"
        :alt="`${alt}（亮色主题）`"
        draggable="false"
        :style="{ clipPath: `inset(0 ${100 - pos}% 0 0)` }"
      />
      <div
        class="handle"
        :style="{ left: `${pos}%` }"
        role="slider"
        tabindex="0"
        aria-label="拖动对比亮色与暗色主题"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(pos)"
        @keydown="onKey"
      >
        <span class="knob">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
        </span>
      </div>
      <span class="tag tag-l">亮色</span>
      <span class="tag tag-r">暗色</span>
    </div>
  </div>
</template>

<style scoped>
.showcase {
  border-radius: 18px;
  background: var(--eg-surface);
  border: 1px solid var(--eg-border);
  box-shadow: var(--eg-shadow-shot);
  overflow: hidden;
}

.chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-bottom: 1px solid var(--eg-border);
  background: var(--eg-surface-2);
}

.chrome i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--eg-border-strong);
}

.url {
  margin-left: 12px;
  padding: 2px 12px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  background: var(--eg-surface);
  border: 1px solid var(--eg-border);
  border-radius: 999px;
}

.frame {
  position: relative;
  aspect-ratio: 16 / 10;
  cursor: ew-resize;
  user-select: none;
  touch-action: pan-y;
  background: var(--eg-surface-2);
}

.shot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top left;
  pointer-events: none;
}

.handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.35);
  outline: none;
}

.knob {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25);
}

.handle:focus-visible .knob {
  box-shadow: 0 0 0 3px var(--eg-primary), 0 6px 16px rgba(15, 23, 42, 0.25);
}

.knob svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: var(--eg-primary);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tag {
  position: absolute;
  bottom: 12px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
  pointer-events: none;
}

.tag-l {
  left: 12px;
  color: #1e3a8a;
  background: rgba(255, 255, 255, 0.85);
}

.tag-r {
  right: 12px;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.7);
}

@media (max-width: 640px) {
  .url {
    display: none;
  }
}
</style>
