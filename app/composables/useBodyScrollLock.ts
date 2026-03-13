import { watch, onUnmounted } from 'vue'

/**
 * useBodyScrollLock - 鎖定 body 滾動條
 * 當彈窗開啟時鎖定背景滾動，關閉時恢復。
 * @param isLocked - 響應式布林值，true 為鎖定
 */
export function useBodyScrollLock(isLocked: () => boolean) {
  let originalOverflow = ''

  const lock = () => {
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  const unlock = () => {
    document.body.style.overflow = originalOverflow
  }

  watch(isLocked, (locked) => {
    if (locked) {
      lock()
    } else {
      unlock()
    }
  }, { immediate: true })

  // Cleanup on component unmount
  onUnmounted(() => {
    unlock()
  })
}
