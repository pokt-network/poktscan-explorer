'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  selectedTimeCookieKey, selectedTimeParamKey, Time,
} from '@/app/dashboards/services/constants'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { setCookie } from '@/app/utils/cookies'

const labelByTime: Record<Time, string> = {
  [Time.Last24h]: 'Last 24h',
  [Time.Last7d]: 'Last 7d',
  [Time.Last30d]: 'Last 30d',
  [Time.Last90d]: 'Last 90d',
}

interface TimeSelectorProps {
  selectedTime: string
  includeLabel?: boolean
  options?: Array<Time>
}

export default function TimeSelector({
  selectedTime,
  includeLabel = true,
  options = [Time.Last24h, Time.Last7d, Time.Last30d, Time.Last90d],
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
        setCookie(selectedTimeCookieKey, newValue)

        const params = new URLSearchParams(searchParams)
        params.set(selectedTimeParamKey, newValue)
        router.push(`${pathname}?${params.toString()}`)
      }}
    >
      <SelectTrigger className={'w-[140px] h-[30px] text-xs bg-[color:--main-background]'}>
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
