'use client'

import { useDateContext } from '@/app/dates/Context'
import { Button } from '@/components/ui/button'
import { ChevronDown, HardDriveDownload, Loader2 } from 'lucide-react'
import { GridColDef } from '@/app/components/Table'
import { useFormatDate } from '@/app/dates/DateCellText'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { formatSimpleAmount } from '@/app/utils/format'

interface TableDownloadButtonProps {
  rows: Array<any>
  columns: Array<GridColDef>
  csvEndpoint?: string
  activeFilter?: string
  entityFilters?: Record<string, string | string[]>
}

const LIMIT_TO_EXPORT = Number.isSafeInteger(parseInt(process.env.NEXT_PUBLIC_LIMIT_TO_EXPORT || ''))
  ? parseInt(process.env.NEXT_PUBLIC_LIMIT_TO_EXPORT!)
  : 10000;

const dateFields = ['timestamp', 'lastUpdatedTime']
const amountFields = [
  'balance',
  'stakeAmount',
  'supply',
  'outputBalance',
  'fee',
  'amount',
  'slashed',
  'previousStake',
  'afterStake',
]

export default function TableDownloadButton({rows, columns, csvEndpoint, activeFilter, entityFilters}: TableDownloadButtonProps) {
  const {dateTimeColumn, dateTimeZone,} = useDateContext()
  const {formatDate} = useFormatDate()
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadPageData = () => {
    const columnsMap = columns.reduce((acc, col) => {
      if (dateFields.includes(col.field)) {
        acc[col.field] = dateTimeColumn === 'age' ? 'Age' : `DateTime (${dateTimeZone === 'utc' ? 'UTC' : `UTC${utcOffset}`})`
      } else if (amountFields.includes(col.field)) {
        acc[col.field] = `${col.headerName} (POKT)`
      } else {
        acc[col.field] = col.headerName
      }

      return acc
    }, {})

    const utcOffset = (new Date().getTimezoneOffset() / 60) * -1

    if (columnsMap['detail']) {
      delete columnsMap['detail']
    }

    const headers = Object.values(columnsMap)

    const data = rows.map(row => {
      return Object.keys(row).reduce((acc, key) => {
        if (key in columnsMap) {
          let value = row[key]

          if (dateFields.includes(key)) {
            value = formatDate(row[key])
          }

          if (amountFields.includes(key)) {
            value = row[`raw_${key}`] || row[key] || 0
          }

          if (Array.isArray(value)) {
            acc[key] = `${value.at(0) || ''}${value.length > 1 ? `+${value.length - 1}` : ''}`
          } else {
            acc[key] = value
          }
        }

        return acc
      }, {})
    })

    const csvData = []

    for (const row of data) {
      const rowData: Array<string> = []
      for (const key in columnsMap) {
        rowData.push(row[key])
      }
      csvData.push(rowData.join(','))
    }

    csvData.unshift(headers.join(','))

    const csv = csvData.join('\n')

    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `export-${'entity'}-list-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllData = () => {
    if (!csvEndpoint) return

    setIsDownloading(true)

    let url = csvEndpoint
    const params = new URLSearchParams()

    // Add entity-specific filters first
    if (entityFilters) {
      Object.entries(entityFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else if (value) {
          params.append(key, value)
        }
      })
    }

    if (activeFilter && activeFilter !== 'all') {
      params.append('filter', activeFilter)
    }

    const paramString = params.toString()
    if (paramString) {
      url = `${url}${url.includes('?') ? '&' : '?'}${paramString}`
    }

    const link = document.createElement('a')
    link.href = url
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      document.body.removeChild(link)
    }, 100)

    setTimeout(() => {
      setIsDownloading(false)
    }, 1000)
  }

  if (!csvEndpoint) {
    return (
      <Button
        variant={'outline'}
        className={'border-[color:--divider] text-xs bg-[color:--background] h-[28px] px-2 font-normal hover:bg-[color:--highlight-option] duration-150'}
        onClick={downloadPageData}
      >
        <HardDriveDownload className={'w-4 h-4 stroke-1'} />
        Download Page Data
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={'outline'}
          className={`border-[color:--divider] text-xs h-[28px] px-2 font-normal duration-150 ${
            isDownloading
              ? 'bg-[color:--primary-background] text-white border-[color:--primary-background] cursor-wait'
              : 'bg-[color:--background] hover:bg-[color:--highlight-option]'
          }`}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className={'w-4 h-4 stroke-1 animate-spin'} />
          ) : (
            <HardDriveDownload className={'w-4 h-4 stroke-1'} />
          )}
          {isDownloading ? 'Downloading CSV...' : 'Download CSV'}
          {!isDownloading && <ChevronDown className={'w-3 h-3 ml-1'} />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[color:--main-background] border-[color:--divider]">
        <DropdownMenuItem
          onClick={downloadPageData}
          className="cursor-pointer hover:bg-[color:--highlight-option] focus:bg-[color:--highlight-option] transition-colors duration-150"
        >
          Page Data
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={downloadAllData}
          disabled={isDownloading}
          className="cursor-pointer hover:bg-[color:--highlight-option] focus:bg-[color:--highlight-option] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent transition-colors duration-150"
        >
          All Data (up to {formatSimpleAmount(LIMIT_TO_EXPORT)} items)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
