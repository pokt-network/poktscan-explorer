'use client'
import { formatAmount } from '@/app/utils/format'
import usePrice from '@/app/hooks/usePrice'

interface PriceProps {
  showLabel?: boolean;
  priceColor?: string
  fontSize?: string
}

export default function Price({showLabel = true, priceColor='--primary', fontSize = 'xs'}: PriceProps) {
  const {usd, usd_24h_change} = usePrice()
  let changeColor: string

  if (usd_24h_change > 0) {
    changeColor = 'text-[color:--success]'
  } else if (usd_24h_change < 0) {
    changeColor = 'text-[color:--error]'
  } else {
    changeColor = 'text-neutral-400'
  }

  const color = `text-[color:${priceColor}]`
  const text = `text-${fontSize}`

  return (
    <p className={`${text} text-[color:--secondary]`}>
      {showLabel && "POKT Price: "}<span className={color}>${usd ? formatAmount({
        amount: usd,
      }) : '-'}</span> <span
      className={changeColor}>({usd_24h_change?.toFixed(2)}%)</span>
    </p>
  )
}
