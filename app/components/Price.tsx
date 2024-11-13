import {Price as PriceType} from '@/app/api/price'

interface PriceProps extends PriceType {
  showLabel?: boolean;
  priceColor?: string
}

export default function Price({usd, usd_24h_change, showLabel = true, priceColor='--primary'}: PriceProps) {
  let changeColor: string

  if (usd_24h_change > 0) {
    changeColor = 'text-[color:--success]'
  } else if (usd_24h_change < 0) {
    changeColor = 'text-[color:--error]'
  } else {
    changeColor = 'text-neutral-400'
  }

  const color = `text-[color:${priceColor}]`

  return (
    <p className={"text-xs text-[color:--secondary]"}>
      {showLabel && "POKT Price: "}<span className={color}>${usd.toFixed(4)}</span> <span
      className={changeColor}>({usd_24h_change.toFixed(2)}%)</span>
    </p>
  )
}
