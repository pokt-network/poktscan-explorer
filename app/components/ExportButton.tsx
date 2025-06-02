'use client'

import { Button } from '@/components/ui/button'
import { HardDriveDownload } from 'lucide-react'
import { ClientExportOptions, exportToCsvFromClient } from '@/app/utils/exportToCsv'
import { useDateContext } from '@/app/dates/Context'

type ExportButtonProps<T extends object> = Omit<ClientExportOptions<T>, 'useUtc'>

export default function ExportButton<T extends object>(props: ExportButtonProps<T>) {
  const {dateTimeZone} = useDateContext()
  return (
    <Button
      variant={'outline'}
      onClick={() => {
        exportToCsvFromClient({
          ...props,
          useUtc: dateTimeZone === 'utc',
        })
      }}
      className={'border-[color:--divider] text-[color:--primary] w-[30px] h-[30px] rounded-sm hover:border-[color:--primary] hover:text-[color:--primary]'}
    >
      <HardDriveDownload />
    </Button>
  )
}
