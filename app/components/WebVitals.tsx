'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useEffect } from 'react'

const logWebVitals = (metric: Parameters<typeof useReportWebVitals>[0]) => {
  console.log(metric)
}

export default function WebVitals() {
  useReportWebVitals(logWebVitals)

  // Monitor memory usage
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return

    const checkMemory = () => {
      const memory = (performance as any).memory
      if (memory) {
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)

        console.log(`[Memory] Used: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`)

        // Warn if memory usage is high
        if (usedMB > limitMB * 0.8) {
          console.warn(`⚠️ HIGH MEMORY USAGE: ${usedMB}MB / ${limitMB}MB (${Math.round(usedMB/limitMB*100)}%)`)
        }
      }
    }

    // Check memory every 10 seconds
    const interval = setInterval(checkMemory, 10000)
    checkMemory() // Initial check

    return () => clearInterval(interval)
  }, [])

  return null
}
