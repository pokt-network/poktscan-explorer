'use client'
import { useEffect, useState } from 'react'

export default function ChainChip() {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { origin } = window.location;
      setOrigin(origin);
    }
  }, [])

  if (!origin) {
    return null
  }


  const isAlphaSelected = origin.includes('alpha')
  const isBetaSelected = origin.includes('beta')

  return (
    <div className={'border px-2 flex items-center h-[22px] absolute top-2.5 left-[0px] border-[color:transparent] rounded-md tracking-wider'}>
      <p className={'text-xs text-[color:--secondary] dark:text-[color:white] font-bold'}>
        {isAlphaSelected ? 'Alpha' : isBetaSelected ? 'Beta' : 'Mainnet'}
      </p>
    </div>
  )
}
