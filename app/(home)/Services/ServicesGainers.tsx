import { AugmentedItem } from '@/app/(home)/Services/ServicesCard'
import { ArrowDown, ArrowUp } from 'lucide-react'

interface ServicesGainersProps {
  data: Array<AugmentedItem>
}

export default function ServicesGainers({data}: ServicesGainersProps) {
  const biggestGainers = data
    .sort((a, b) => b.changes.computedUnits - a.changes.computedUnits)
    .slice(0, 5)

  const bestPerformance = data
    .sort((a, b) => b.percentages.computedUnits - a.percentages.computedUnits)
    .slice(0, 5)

  return (
    <div className={'flex flex-col sm:flex-row gap-4 w-full'}>
      <div className={'flex flex-col border border-[color:--divider] rounded-md w-full'}>
        <div className={'border-b border-[color:--divider] w-full h-[40px] items-center flex px-2'}>
          <p className={'text-sm font-bold'}>Biggest Gainers</p>
        </div>
        {biggestGainers.map((item, index) => {
          const value = item.changes.computedUnits || 0
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-2 p-2 ${index !== biggestGainers.length - 1 ? 'border-b' : ''} border-[color:--divider]`}
            >
              <p className={'text-xs'}>
                {item.id}
              </p>
              <div className={'flex items-center gap-2'}>
                <p className={'text-sm font-bold'}>
                  {Number(Math.abs(value).toFixed(1)).toLocaleString()}%
                </p>
                {value > 0 ? (
                  <ArrowUp className={'text-[color:--success] h-4 w-4'} />
                ) : (
                  <ArrowDown className={'text-[color:--error] h-4 w-4'} />
                )}

              </div>
            </div>
          )
        })}
      </div>
      <div className={'flex flex-col border border-[color:--divider] rounded-md w-full'}>
        <div className={'border-b border-[color:--divider] w-full h-[40px] items-center flex px-2'}>
          <p className={'text-sm font-bold'}>Best Performance</p>
        </div>
        {bestPerformance.map((item, index) => {
          const value = item.percentages.computedUnits || 0
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-2 p-2 ${index !== bestPerformance.length - 1 ? 'border-b' : ''} border-[color:--divider]`}
            >
              <p className={'text-xs whitespace-nowrap overflow-hidden overflow-ellipsis'}>
                {item.id}
              </p>
              <div className={'flex items-center gap-2'}>
                <p className={'text-sm font-bold'}>
                  {Number(Math.abs(value).toFixed(1)).toLocaleString()}%
                </p>
                {value > 0 ? (
                  <ArrowUp className={'text-[color:--success] h-4 w-4'} />
                ) : (
                  <ArrowDown className={'text-[color:--error] h-4 w-4'} />
                )}

              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
