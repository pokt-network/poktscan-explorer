'use client'

import { ChartTypeSelect } from '@/app/Charts/ChartType'
import ScreenshotButton from '@/app/components/ScreenshotButton'
import React from 'react'
import { useDataContext } from '@/app/context/DataContext'
import ExportButton from '@/app/components/ExportButton'
import { convertUpoktToPokt } from '@/app/utils/format'
import { CsvColumn } from '@/app/utils/exportToCsv'
import { chartTypeCookieKey, containerId } from '@/app/tools/RewardsByAddresses/constants'
import { RewardItem } from '@/app/tools/RewardsByAddresses/RewardsByAddressChart'
import { isValidPoktAddress } from '@/app/utils/poktroll'

const csvFormatter = (field: keyof RewardItem, row: RewardItem) => {
  switch (field) {
    case 'point':
      return row[field]
    case 'totalAmount':
      return convertUpoktToPokt(row.totalAmount).toString()
    default:
      return row[field]
  }
}

const csvColumns: Array<CsvColumn> = [
  {
    field: 'point',
    headerName: 'Point',
  },
  {
    field: 'totalAmount',
    headerName: 'Total Amount',
  },
]

export default function CardActions() {
  const {data} = useDataContext<RewardItem>()

  if (!data.length) return null

  const includeAddress = isValidPoktAddress(data.at(0)?.id || '')

  return (
    <div className={'flex flex-row items-center gap-2'}>
      <ChartTypeSelect chartTypeCookieKey={chartTypeCookieKey} />
      <ExportButton
        columns={[
          ...(includeAddress ? [{
            field: 'id',
            headerName: 'Address',
          }] : []),
          ...csvColumns,
        ]}
        formatterFunction={csvFormatter}
        fileNameKey={'rewards_by_address_csv'}
        rows={data}
      />
      <ScreenshotButton
        baseFileName={'rewards_by_address'}
        nodeId={containerId}
      />
    </div>
  )
}
