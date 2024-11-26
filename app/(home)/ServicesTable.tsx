import { GridColDef } from '@/app/components/Table'
import { AugmentedItem } from '@/app/(home)/ServicesCard'
import BaseTable from '@/app/components/BaseTable'
import { formatAmount, formatUpokt } from '@/app/utils/format'

interface Row {
  id: string
  computedUnits: string
  change: number
  network: number
  relays: string
  claimedUpokt: number
}

export default function ServicesTable({data}: {data: AugmentedItem[]}) {
  const columns: Array<GridColDef> = [
    {
      field: 'id',
      headerName: 'Service',
      minWidth: 100,
      renderCell: (row: Row) => {
        return (
          <span className={'text-xs font-bold'}>
            {row.id}
          </span>
        )
      }
    },
    {
      field: 'computedUnits',
      headerName: 'Computed Units',
      minWidth: 100,
      renderCell: (row: Row) => {
        return (
          <span className={'text-xs'}>
            {formatAmount({
              amount: row.computedUnits,
              abbreviateThreshold: 1e6,
            })}
          </span>
        )
      }
    },
    {
      field: 'change',
      headerName: 'Change',
      width: 70,
      renderCell: (row: Row) => {
        let color = 'text-neutral-400'

        if (row.change > 0) {
          color = 'text-[color:--success]'
        } else if (row.change < 0) {
          color = 'text-[color:--error]'
        }

        return (
          <span className={`text-xs ${color} font-bold`}>
            {Number(Math.abs(row.change).toFixed(1))}%
          </span>
        )
      }
    },
    {
      field: 'network',
      headerName: 'Network',
      width: 76,
      renderCell: (row: Row) => {
        return (
          <span className={'text-xs font-bold text-[color:--secondary]'}>
            {row.network.toFixed(1)}%
          </span>
        )
      }

    },
    {
      field: 'relays',
      headerName: 'Relays',
      minWidth: 100,
      renderCell: (row: Row) => {
        return (
          <span className={'text-xs'}>
            {formatAmount({
              amount: row.relays,
              abbreviateThreshold: 1e6,
            })}
          </span>
        )
      }
    },
    {
      field: 'claimedUpokt',
      headerName: 'POKT',
      minWidth: 100,
      renderCell: (row: Row) => {
        return (
          <span className={'text-xs'}>
            {formatUpokt({amount: row.claimedUpokt})}
          </span>
        )
      }
    }
  ]

  const rows: Array<Row> = data.map((item) => {
    return {
      id: item.id,
      computedUnits: item.sum.computedUnits.toLocaleString(),
      change: item.changes.computedUnits,
      network: item.percentages.computedUnits,
      relays: item.sum.relays.toLocaleString(),
      claimedUpokt: item.sum.claimedUpokt,
    }
  })

  return (
    <div className={'overflow-auto flex sm:h-[600px]'}>
      <BaseTable columns={columns} rows={rows} />
    </div>
  )
}
