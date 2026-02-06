import DefaultTheme from 'vitepress/theme'
import { onMounted, onUnmounted } from 'vue'
import './custom.css'

function setupImageZoom() {
  const overlay = document.createElement('div')
  overlay.className = 'img-zoom-overlay'
  overlay.innerHTML = '<img alt="preview" class="img-zoom-preview" />'

  const preview = overlay.querySelector('img') as HTMLImageElement
  let lastFocused: HTMLElement | null = null

  const close = () => {
    overlay.classList.remove('is-open')
    document.body.classList.remove('img-zoom-lock')
    if (lastFocused) {
      lastFocused.focus()
      lastFocused = null
    }
  }

  const open = (img: HTMLImageElement) => {
    preview.src = img.currentSrc || img.src
    preview.alt = img.alt || 'image preview'
    overlay.classList.add('is-open')
    document.body.classList.add('img-zoom-lock')
    lastFocused = document.activeElement as HTMLElement
  }

  const isZoomable = (img: HTMLImageElement) => {
    if (img.closest('a')) return false
    if (img.classList.contains('no-zoom')) return false
    if (img.closest('.img-zoom-overlay')) return false
    return !!img.closest('.vp-doc, .VPHome')
  }

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const clickedImage = target?.closest('img') as HTMLImageElement | null

    if (!clickedImage) {
      if (overlay.classList.contains('is-open') && target === overlay) {
        close()
      }
      return
    }

    if (!isZoomable(clickedImage)) return
    event.preventDefault()
    open(clickedImage)
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
      close()
    }
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
  setup() {
    let cleanup: (() => void) | null = null

    onMounted(() => {
      cleanup = setupImageZoom()
    })

    onUnmounted(() => {
      cleanup?.()
      cleanup = null
    })
  }
}
