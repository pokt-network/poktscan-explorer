'use client'

import type { CsvColumn } from '@/app/utils/exportToCsv'
import type { ChartItem } from '@/app/(home)/CustomizableCompUnitsChart/Chart'
import React from 'react'
import { convertUpoktToPokt } from '@/app/utils/format'
import { ChartTypeSelect } from '@/app/Charts/ChartType'
import ExportButton from '@/app/components/ExportButton'
import { useDataContext } from '@/app/context/DataContext'
import ScreenshotButton from '@/app/components/ScreenshotButton'
import { chartTypeCookieKey, containerId } from '@/app/(home)/CustomizableCompUnitsChart/constants'

const csvColumns: Array<CsvColumn> = [
  {
    field: 'start_date',
    headerName: 'Date',
  },
  {
    field: 'totalRelays',
    headerName: 'Relays'
  },
  {
    field: 'totalComputedUnits',
    headerName: 'Computed Units'
  },
  {
    field: 'totalPokt',
    headerName: 'POKT'
  }
]

function formatterFunction(field: keyof ChartItem, row: ChartItem) {
  if (field === 'totalPokt') {
    return convertUpoktToPokt(row.totalPokt).toString()
  }

  return row[field]?.toString() || ''
}

export default function CompUnitsActions() {
  const { data } = useDataContext<ChartItem>()

  return (
    <div className={'w-[200px] flex flex-row items-center gap-2'}>
      <ChartTypeSelect chartTypeCookieKey={chartTypeCookieKey} />
      <ExportButton
        rows={data}
        columns={csvColumns}
        fileNameKey={'computed_units'}
        formatterFunction={formatterFunction}
      />
      <ScreenshotButton
        baseFileName={'computed_units'}
        nodeId={containerId}
      />
    </div>
  )
}

