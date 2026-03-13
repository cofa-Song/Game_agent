import { useState, useCookie } from '#app'
import zhTW from '~/locales/zh-TW.json'
import zhCN from '~/locales/zh-CN.json'
import en from '~/locales/en.json'

const locales: Record<string, any> = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  'en': en
}

export const useI18n = () => {
  const locale = useState<string>('locale', () => 'zh-TW')
  const localeCookie = useCookie('app-locale')

  // Initialize from cookie if available
  if (localeCookie.value && locales[localeCookie.value]) {
    locale.value = localeCookie.value
  }

  const t = (path: string, params?: Record<string, any>) => {
    const keys = path.split('.')
    let current = locales[locale.value]
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        return path // Fallback to path string
      }
    }
    
    if (typeof current !== 'string') {
      return current
    }

    let result = current
    if (params) {
      Object.keys(params).forEach(key => {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key])
      })
    }
    
    return result
  }

  const setLocale = (newLocale: string) => {
    if (locales[newLocale]) {
      locale.value = newLocale
      localeCookie.value = newLocale
    }
  }

  return {
    locale,
    t,
    setLocale,
    locales: Object.keys(locales)
  }
}
