'use client'

import ExportButton from '@/app/components/ExportButton'
import { useDataContext } from '@/app/context/DataContext'
import columns, { ServicePerformanceRow } from '@/app/dashboards/services/PerformanceTable/columns'
import { CsvColumn } from '@/app/utils/exportToCsv'
import { formatAmount, formatSimpleAmount } from '@/app/utils/format'

const csvColumns: Array<CsvColumn> = columns.map((column) => ({
  field: column.field,
  headerName: column.field === 'earnAvg' ? 'Earn Avg (POKT)' : column.headerName?.toString() || '',
}))

const formatterFunction = (field: keyof ServicePerformanceRow, row: ServicePerformanceRow) => {
  switch (field) {
    case 'serviceId':
      return row.serviceName ? `${row.serviceName} (${row.serviceId})` : row.serviceId
    case 'network':
      return row.network.toFixed(1) + '%'
    case 'change':
      return row.change.toFixed(1) + '%'
    case 'relays':
    case 'computedUnits':
    case 'stakedApps':
    case 'stakedNodes':
      return formatSimpleAmount(row[field])
    case 'earnAvg':
      return formatAmount({
        amount: row[field],
        denom: 'upokt'
      }).split(' ')[0]
    default:
      return row[field]
  }
}

export default function PerformanceCardActions() {
  const {data} = useDataContext<ServicePerformanceRow>()

  if (!data.length) return null

  return (
    <ExportButton
      columns={csvColumns}
      formatterFunction={formatterFunction}
      rows={data}
      fileNameKey={'services_performance'}
    />
  )
}
