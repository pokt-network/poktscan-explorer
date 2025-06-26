'use client'

import type { DataItem } from '@/app/dashboards/services/Productivity/Chart'
import { ChartTypeSelect } from '@/app/Charts/ChartType'
import ScreenshotButton from '@/app/components/ScreenshotButton'
import { containerId } from '@/app/dashboards/services/Productivity/constants'
import React from 'react'
import { useDataContext } from '@/app/context/DataContext'
import ExportButton from '@/app/components/ExportButton'
import { formatAmount, formatSimpleAmount } from '@/app/utils/format'
import { CsvColumn } from '@/app/utils/exportToCsv'
import { chartTypeCookieKey } from '@/app/dashboards/services/constants'

const csvFormatter = (field: keyof DataItem, row: DataItem) => {
  switch (field) {
    case 'id':
    case 'point':
      return row[field]
    case 'relays':
    case 'avgRelays':
    case 'computedUnits':
    case 'avgComputedUnits':
    case 'avgStakedSuppliers':
      return formatSimpleAmount(row[field])
    case 'claimedUpokt':
    case 'avgClaimedUpokt':
      return formatAmount({
        amount: row[field],
        denom: 'upokt',
      }).split(' ')[0]
    default:
      return row[field]
  }
}

const csvColumns: Array<CsvColumn> = [
  {
    field: 'id',
    headerName: 'Service ID',
  },
  {
    field: 'point',
    headerName: 'Point',
  },
  {
    field: 'relays',
    headerName: 'Relays',
  },
  {
    field: 'avgRelays',
    headerName: 'Avg Relays',
  },
  {
    field: 'computedUnits',
    headerName: 'Computed Units',
  },
  {
    field: 'avgComputedUnits',
    headerName: 'Avg Computed Units',
  },
  {
    field: 'claimedUpokt',
    headerName: 'Claimed POKT',
  },
  {
    field: 'avgClaimedUpokt',
    headerName: 'Avg Claimed uPOKT',
  },
  {
    field: 'avgStakedSuppliers',
    headerName: 'Avg Staked Suppliers',
  },
]

export default function CardActions() {
  const {data} = useDataContext<DataItem>()

  if (!data.length) return null

  return (
    <div className={'flex flex-row items-center gap-2'}>
      <ChartTypeSelect chartTypeCookieKey={chartTypeCookieKey} />
      <ExportButton
        columns={csvColumns}
        formatterFunction={csvFormatter}
        fileNameKey={'services_productivity_csv'}
        rows={data}
      />
      <ScreenshotButton
        baseFileName={'services_productivity'}
        nodeId={containerId}
      />
    </div>
  )
}
