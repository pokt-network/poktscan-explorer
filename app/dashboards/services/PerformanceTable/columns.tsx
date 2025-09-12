import EntityLink from '@/app/components/EntityLink'
import { GridColDef } from '@/app/components/Table'

export interface ServicePerformanceRow {
  serviceId: string
  serviceName: string
  stakedNodes: string
  raw_stakedNodes: number
  stakedApps: string
  raw_stakedApps: number
  network: number
  change: number
  computedUnits: string
  raw_computedUnits: number
  relays: string
  raw_relays: number
  earnAvg: string
  raw_earnAvg: number
  totalEarn: string
  raw_totalEarn: number
}

const columns: Array<GridColDef> = [
  {
    field: 'serviceId',
    headerName: 'Service Id',
    renderCell: (row: ServicePerformanceRow) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'service'}
          entityId={row.serviceId}
          copy={{
            enabled: false,
          }}
        />
      </div>
    )
  },
  {
    field: 'serviceName',
    headerName: 'Label',
    renderCell: (row: ServicePerformanceRow) => (
      <p className={'whitespace-nowrap text-ellipsis overflow-hidden'}>
        {row.serviceName}
      </p>
    ),
    maxWidth: 200,
  },
  {
    field: 'network',
    headerName: 'Network',
    align: 'right',
    renderCell: (row: ServicePerformanceRow) => (
      <span className={'text-[color:--secondary] font-bold'}>
          {row.network.toFixed(1)}%
        </span>
    )
  },
  {
    field: 'change',
    headerName: 'Change',
    align: 'right',
    renderCell: (row: ServicePerformanceRow) => {
      let className = 'text-[color:--secondary] font-bold'

      if (row.change > 0) {
        className = 'text-[color:--success] font-bold'
      } else if (row.change < 0) {
        className = 'text-[color:--error] font-bold'
      }

      return (
        <span className={className}>
            {Math.abs(row.change).toFixed(1)}%
          </span>
      )
    }
  },
  {
    field: 'computedUnits',
    headerName: 'Computed Units',
    align: 'right'
  },
  {
    field: 'relays',
    headerName: 'Relays',
    align: 'right'
  },
  {
    field: 'earnAvg',
    headerName: 'Earn Avg POKT',
    align: 'right'
  },
  {
    field: 'totalEarn',
    headerName: 'Total POKT',
    align: 'right'
  },
  {
    field: 'stakedNodes',
    description: 'Current Staked Nodes',
    headerName: 'Nodes',
    align: 'right'
  },
  {
    field: 'stakedApps',
    description: 'Current Staked Apps',
    headerName: 'Apps',
    align: 'right'
  },
]

export default columns
