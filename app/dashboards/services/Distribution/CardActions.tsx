'use client'

import React from 'react'
import ScreenshotButton from '@/app/components/ScreenshotButton'
import { containerId } from '@/app/dashboards/services/Distribution/constants'
import { useDataContext } from '@/app/context/DataContext'
import { CsvColumn } from '@/app/utils/exportToCsv'
import { ChartItem } from '@/app/Charts/BaseDoughnut'
import { formatSimpleAmount } from '@/app/utils/format'
import ExportButton from '@/app/components/ExportButton'

const csvColumns: Array<CsvColumn> = [
  {
    field: 'id',
    headerName: 'Service',
  },
  {
    field: 'total',
    headerName: 'Computed Units',
  },
  {
    field: 'percent',
    headerName: 'Percent',
  }
]

const formatterFunction = (field: keyof ChartItem, row: ChartItem) => {
  switch (field) {
    case 'id':
      return row[field]
    case 'total':
      return formatSimpleAmount(row[field])
    case 'percent':
      return row[field].toFixed(1) + '%'
  }
}

export default function DistributionCardActions() {
  const {data} = useDataContext<ChartItem>()

  if (!data.length) return null

  return (
    <div className={'flex flex-row items-center gap-2'}>
      <ExportButton
        fileNameKey={'services_distribution'}
        columns={csvColumns}
        rows={data}
        formatterFunction={formatterFunction}
      />
      <ScreenshotButton
        baseFileName={'services_distribution'}
        nodeId={containerId}
      />
    </div>
  )
}
