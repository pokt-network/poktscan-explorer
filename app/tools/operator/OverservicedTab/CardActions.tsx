'use client'

import React from 'react'
import { convertUpoktToPokt } from '@/app/utils/format'
import { ChartTypeSelect } from '@/app/Charts/ChartType'
import ExportButton from '@/app/components/ExportButton'
import type { CsvColumn } from '@/app/utils/exportToCsv'
import { useDataContext } from '@/app/context/DataContext'
import ScreenshotButton from '@/app/components/ScreenshotButton'
import { overservicedContainerId, overservicedChartTypeCookieKey } from '@/app/tools/operator/constants'

interface OverservicedRow {
  start_date: string
  expected_burn: number
  effective_burn: number
}

export const csvColumns: Array<CsvColumn> = [
  {
    field: 'start_date',
    headerName: 'Date',
  },
  {
    field: 'effective_burn',
    headerName: 'Effective Burn (POKT)',
  },
  {
    field: 'expected_burn',
    headerName: 'Expected Burn (POKT)',
  },
  {
    field: 'difference',
    headerName: 'Difference (POKT)',
  },
]

export const formatterFunction = (field: string, row: OverservicedRow) => {
  if (field === 'effective_burn' || field === 'expected_burn') {
    return convertUpoktToPokt(row[field]).toString()
  }

  if (field === 'difference') {
    return convertUpoktToPokt(row.expected_burn - row.effective_burn).toString()
  }

  return row[field as keyof OverservicedRow]?.toString() || ''
}

export default function OverservicedActions() {
  const { data } = useDataContext<OverservicedRow>()

  return (
    <div className={'flex flex-row items-center gap-2'}>
      <ChartTypeSelect chartTypeCookieKey={overservicedChartTypeCookieKey} />
      <ExportButton
        columns={csvColumns}
        formatterFunction={formatterFunction}
        fileNameKey={'operator_overserviced'}
        rows={data}
      />
      <ScreenshotButton
        baseFileName={'operator_overserviced'}
        nodeId={overservicedContainerId}
      />
    </div>
  )
}
