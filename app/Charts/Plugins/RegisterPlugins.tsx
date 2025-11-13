'use client'
import { Chart, registerables } from 'chart.js'
import { useEffect } from 'react'

export default function RegisterPlugins() {
  useEffect(() => {
    // Note: registerables includes all standard Chart.js components
    // Only register additional plugins here, not duplicates
    Chart.register(...registerables)
  }, [])

  return null

}
