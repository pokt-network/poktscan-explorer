'use client'

import usePrice from '@/app/hooks/usePrice'
import { formatAmount } from '@/app/utils/format'

export default function MarketCap() {
  const { data: { usd_market_cap } } = usePrice()

  return `$${formatAmount({
    amount: usd_market_cap?.toFixed(2) || 0,
    abbreviateThreshold: 0
  })}`
}
