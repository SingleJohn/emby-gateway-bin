import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { onMounted, onUnmounted } from 'vue'

import FlowDiagram from './components/FlowDiagram.vue'
import Shot from './components/Shot.vue'
import HomePage from './components/home/HomePage.vue'
import { tokenize } from './tokenize'

import './styles/vars.css'
import './styles/doc.css'

/** 文内图片点击放大；首页与带链接的图片除外 */
function setupImageZoom() {
  const overlay = document.createElement('div')
  overlay.className = 'img-zoom-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', '图片预览，按 Esc 关闭')
  overlay.innerHTML = '<img alt="" class="img-zoom-preview" />'
  const preview = overlay.querySelector('img') as HTMLImageElement
  let lastFocused: HTMLElement | null = null

  const close = () => {
    overlay.classList.remove('is-open')
    document.body.classList.remove('img-zoom-lock')
    lastFocused?.focus()
    lastFocused = null
  }

  const open = (img: HTMLImageElement) => {
    preview.src = img.currentSrc || img.src
    preview.alt = img.alt
    lastFocused = document.activeElement as HTMLElement
    overlay.classList.add('is-open')
    document.body.classList.add('img-zoom-lock')
  }

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (overlay.classList.contains('is-open')) {
      close()
      return
    }
    const img = target?.closest('img') as HTMLImageElement | null
    if (!img || img.closest('a') || img.classList.contains('no-zoom')) return
    if (!img.closest('.vp-doc')) return
    event.preventDefault()
    open(img)
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-open')) close()
  }

  document.body.appendChild(overlay)
  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKeydown)
  return () => {
    document.removeEventListener('click', onClick)
    document.removeEventListener('keydown', onKeydown)
    overlay.remove()
  }
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app, siteData }) {
    app.component('Shot', Shot)
    app.component('FlowDiagram', FlowDiagram)
    app.component('HomePage', HomePage)

    // 站点配置会被序列化成 JSON 传到浏览器，函数会丢失；
    // 在这里把中文分词补回去，保证查询和索引用同一套切词规则。
    if (typeof window !== 'undefined') {
      const search = siteData.value.themeConfig?.search
      if (search?.provider === 'local') {
        search.options ||= {}
        search.options.miniSearch ||= {}
        search.options.miniSearch.options = {
          ...search.options.miniSearch.options,
          tokenize,
        }
      }
    }
  },
  setup() {
    let cleanup: (() => void) | null = null
    onMounted(() => {
      cleanup = setupImageZoom()
    })
    onUnmounted(() => {
      cleanup?.()
      cleanup = null
    })
  },
} satisfies Theme
