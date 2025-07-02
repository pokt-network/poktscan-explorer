'use client'

import ExportButton from '@/app/components/ExportButton'
import { useDataContext } from '@/app/context/DataContext'
import { CsvColumn } from '@/app/utils/exportToCsv'
import React from 'react'
import { rewardsByServiceColumns, RewardsByServiceRow } from '@/app/tools/operator/ServicesTab/columns'

const labelByColumn: Record<string, string> = {

}

const csvColumns: Array<CsvColumn> = rewardsByServiceColumns.map((column) => ({
  field: column.field,
  headerName: labelByColumn[column.field] || column.headerName?.toString() || '',
}))

const formatterFunction = (field: keyof RewardsByServiceRow, row: DataByDelegatorRow) => {
  switch (field) {
    case 'relays':
    case 'computedUnits':
    case 'grossRewards':
    case 'netRewards':
      return row[`raw_${field}`] || 0
    default:
      return row[field]
  }
}

interface TableCardActionsProps {
  children?: React.ReactNode
}

export default function TableCardActions({children}: TableCardActionsProps) {
  const {data} = useDataContext<DataByDelegatorRow>()

  return (
    <div className={'flex flex-row items-center gap-2'}>
      {children}
      {data.length > 0 && (
        <ExportButton
          columns={csvColumns}
          formatterFunction={formatterFunction}
          rows={data}
          fileNameKey={'rewards_by_service'}
        />
      )}
    </div>
  )
}
