'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  selectedTimeCookieKey, selectedTimeParamKey, Time,
} from '@/app/tools/operator/constants'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { setCookie } from '@/app/utils/cookies'

interface TimeSelectorProps {
  selectedTime: string
}

export default function TimeSelector({selectedTime}: TimeSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className={'flex flex-row items-center gap-3 h-[30px]'}>
      <label className={'text-sm'}>
        Time
      </label>
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
          <SelectItem value={Time.Last24h}>
            Last 24 hours
          </SelectItem>
          <SelectItem value={Time.Last48h}>
            Last 48 hours
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

  )
}
