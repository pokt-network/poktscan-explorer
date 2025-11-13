'use client'
import dynamic from 'next/dynamic'
import EvolutionChartsLoader from './Loader'

// Lazy load EvolutionCharts to reduce hydration memory spike
// This component contains 4 charts with heavy date processing in useMemo
const EvolutionCharts = dynamic(() => import('./EvolutionCharts'), {
  loading: () => <EvolutionChartsLoader />,
  ssr: false, // Disable SSR to prevent hydration during initial page load
})

export default EvolutionCharts
