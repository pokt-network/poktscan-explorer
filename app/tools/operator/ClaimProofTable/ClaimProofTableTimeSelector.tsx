'use client'

import { Button } from '@/components/ui/button'
import { selectedTimeCookieKey, TimeClaimProofTable } from '@/app/tools/operator/constants'
import { clsx } from 'clsx'
import { useMultipleOptionContext } from '@/app/context/MultipleOptionContext'
import { setCookie } from '@/app/utils/cookies'

const timeOptionsLabel: Record<TimeClaimProofTable, string> = {
  last24h: 'Last 24h',
  last48h: 'Last 48h',
  lastClaimingWindow: 'Last Claiming Window',
}

interface ClaimProofTableProps {
  disable?: true
  initialValue: TimeClaimProofTable
}

export default function ClaimProofTableTimeSelector({disable, initialValue}: ClaimProofTableProps) {
  const {selectedValue, setSelectedValue} = useMultipleOptionContext<TimeClaimProofTable>()

  const activeValue = selectedValue || initialValue

  return (
    <div
      className={
        clsx(
          "flex flex-row gap-4 mt-6 mb-4",
          disable && "opacity-80 pointer-events-none",
        )
      }
    >
      {Object.values(TimeClaimProofTable).map((time) => {
        const isActive = activeValue === time

        if (isActive) {
          return (
            <span
              key={time}
              className={`text-xs px-[10px] font-semibold leading-[36px] cursor-not-allowed select-none rounded-lg transition-transform duration-300 bg-[color:--primary-background] text-white`}
            >
              {timeOptionsLabel[time] || time}
            </span>
          )
        }

        return (
          <Button
            className={`text-xs px-[10px] font-semibold hover:bg-[color:--background] aria-disabled:cursor-not-allowed py-1 rounded-lg transition-transform duration-300 bg-[color:rgba(141,141,141,0.12)]`}
            key={time}
            onClick={() => {
              setSelectedValue(time)
              setCookie(selectedTimeCookieKey, time)
            }}
          >
            {timeOptionsLabel[time] || time}
          </Button>
        )
      })}
    </div>
  )
}
