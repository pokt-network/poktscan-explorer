'use client'

import ExportButton from '@/app/components/ExportButton'
import { useDataContext } from '@/app/context/DataContext'
import { CsvColumn } from '@/app/utils/exportToCsv'
import columns, { DataByDelegatorRow } from '@/app/dashboards/node-running/columns'
import React from 'react'

const labelByColumn: Record<string, string> = {

}

const csvColumns: Array<CsvColumn> = columns.map((column) => ({
  field: column.field,
  headerName: labelByColumn[column.field] || column.headerName?.toString() || '',
}))

const formatterFunction = (field: keyof DataByDelegatorRow, row: DataByDelegatorRow) => {
  switch (field) {
    case 'delegatorAddress':
      return row.delegatorAddress
    case 'proofPokt':
    case 'claimPokt':
    case 'slashed':
      return row[field].split(' ')[0]
    default:
      return row[field]
  }
}

interface TableCardActionsProps {
  children?: React.ReactNode
  filenameKey: string
}

export default function TableCardActions({children, filenameKey}: TableCardActionsProps) {
  const {data} = useDataContext<DataByDelegatorRow>()

  return (
    <div className={'flex flex-row items-center gap-2'}>
      {children}
      {data.length > 0 && (
        <ExportButton
          columns={csvColumns}
          formatterFunction={formatterFunction}
          rows={data}
          fileNameKey={filenameKey}
        />
      )}
    </div>
  )
}
