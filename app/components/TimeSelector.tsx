'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {Time} from '@/app/utils/dates'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { setCookie } from '@/app/utils/cookies'

const labelByTime: Record<Time, string> = {
  [Time.Last24h]: 'Last 24h',
  [Time.Last48h]: 'Last 48h',
  [Time.Last7d]: 'Last 7d',
  [Time.Last30d]: 'Last 30d',
}

interface TimeSelectorProps {
  selectedTime: string
  includeLabel?: boolean
  options?: Array<Time>
  cookie?: string
  param?: string
  onChange?: (time: Time) => void
  enablePush?: boolean
}

export default function TimeSelector({
  selectedTime,
  cookie,
  param,
  onChange,
  enablePush = !!param,
  includeLabel = true,
  options = [Time.Last24h, Time.Last48h, Time.Last7d, Time.Last30d],
}: TimeSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className={'flex flex-row items-center gap-3 h-[30px]'}>
      {includeLabel && (
        <label className={'text-sm'}>
          Time
        </label>
      )}
      <Select
      value={selectedTime}
      onValueChange={(newValue) => {
        if (cookie) {
          setCookie(cookie, newValue)
        }

        if (param) {
          const params = new URLSearchParams(searchParams)
          params.set(param, newValue)
          if (enablePush) {
            router.push(`${pathname}?${params.toString()}`, {scroll: false})
          } else {
            window.history.pushState(null, '', `${pathname}?${params.toString()}`)
          }
        }

        if (onChange) {
          onChange(newValue as Time)
        }
      }}
    >
      <SelectTrigger className={'min-w-20 w-fit gap-1 h-[30px] text-xs bg-[color:--main-background]'}>
        <SelectValue placeholder={'Time'} />
      </SelectTrigger>
      <SelectContent>
        {options?.map(option => (
          <SelectItem value={option} key={option}>
            {labelByTime[option] || option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    </div>
  )
}
