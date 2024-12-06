'use client'

import { useDateContext } from '@/app/dates/Context'
import { Button } from '@/components/ui/button'
import { HardDriveDownload } from 'lucide-react'
import { GridColDef } from '@/app/components/Table'
import { useFormatDate } from '@/app/dates/DateCellText'

interface TableDownloadButtonProps {
  rows: Array<any>
  columns: Array<GridColDef>
}

const dateFields = ['timestamp', 'lastUpdatedTime']
const amountFields = ['balance', 'stakeAmount', 'supply', 'outputBalance', 'fee', 'amount']

export default function TableDownloadButton({rows, columns}: TableDownloadButtonProps) {
  const {dateTimeColumn, dateTimeZone,} = useDateContext()
  const {formatDate} = useFormatDate()

  const downloadData = () => {
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
            value = row[`raw_${key}`]
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

  return (
    <Button
      variant={'outline'}
      className={'border-[color:--divider] text-xs bg-[color:--background] h-[28px] px-2 font-normal hover:bg-[color:--highlight-option] duration-150'}
      onClick={downloadData}
    >
      <HardDriveDownload className={'w-1 h-1 text-[10px] stroke-1'} />
      Download Page Data
    </Button>
  )
}
