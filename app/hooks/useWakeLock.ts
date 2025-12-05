"use client"

import { useEffect, useRef, useState } from 'react'

export function useWakeLock(enabled: boolean = false) {
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const wakeLockRef = useRef<any>(null)

  useEffect(() => {
    // Check if Wake Lock API is supported
    setIsSupported('wakeLock' in navigator)
  }, [])

  useEffect(() => {
    if (!isSupported || !enabled) {
      release()
      return
    }

    request()

    // Re-acquire wake lock when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        request()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      release()
    }
  }, [enabled, isSupported])

  const request = async () => {
    if (!isSupported) return

    try {
      // @ts-ignore - Wake Lock API might not be in all TypeScript definitions
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setIsActive(true)
      console.log('Wake Lock active')

      wakeLockRef.current.addEventListener('release', () => {
        console.log('Wake Lock released')
        setIsActive(false)
      })
    } catch (err) {
      console.error('Wake Lock error:', err)
      setIsActive(false)
    }
  }

  const release = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setIsActive(false)
      } catch (err) {
        console.error('Wake Lock release error:', err)
      }
    }
  }

  const refresh = () => {
    if (enabled && isSupported) {
      request()
    }
  }

  return {
    isSupported,
    isActive,
    request,
    release,
    refresh
  }
}
