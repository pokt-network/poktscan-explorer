'use client'

import { selectedTimeCookieKey, TimeClaimProofTable } from '@/app/tools/operator/constants'
import { useMultipleOptionContext } from '@/app/context/MultipleOptionContext'
import { setCookie } from '@/app/utils/cookies'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const timeOptionsLabel: Record<TimeClaimProofTable, string> = {
  last24h: 'Last 24h',
  last48h: 'Last 48h',
  lastClaimingWindow: 'Last Claiming Window',
}

interface ClaimProofTableProps {
  disable?: boolean
  initialValue: TimeClaimProofTable
}

export default function ClaimProofTableTimeSelector({disable, initialValue}: ClaimProofTableProps) {
  const {selectedValue, setSelectedValue} = useMultipleOptionContext<TimeClaimProofTable>()

  return (
    <Select
      disabled={disable}
      value={selectedValue || initialValue}
      onValueChange={(newValue) => {
        setSelectedValue(newValue as TimeClaimProofTable)
        setCookie(selectedTimeCookieKey, newValue)
      }}
    >
      <SelectTrigger className={'w-fit h-[30px] gap-1 px-2 text-xs bg-[color:--main-background]'}>
        <SelectValue placeholder={'Time'} />
      </SelectTrigger>
      <SelectContent>
        {Object.values(TimeClaimProofTable).map(time => (
          <SelectItem value={time} key={time}>
            {timeOptionsLabel[time] || time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
