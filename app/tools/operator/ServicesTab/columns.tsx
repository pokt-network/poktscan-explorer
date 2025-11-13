import type { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'

export interface RewardsByServiceRow {
  id: string
  relays: string
  raw_rewards: string | number
  computedUnits: string
  raw_computedUnits: string | number
  grossRewards: string
  raw_grossRewards: string | number
  netRewards: string
  raw_netRewards: string | number
}

export const rewardsByServiceColumns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'Service',
    minWidth: 100,
    renderCell: (row: RewardsByServiceRow) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink entity={'service'} entityId={row.id} />
      </div>
    )
  },
  {
    field: 'relays',
    headerName: 'Relays',
    align: 'right',
  },
  {
    field: 'computedUnits',
    headerName: 'Comp. Units',
    align: 'right',
  },
  {
    field: 'grossRewards',
    headerName: 'Gross Rewards',
    align: 'right',
  },
  {
    field: 'netRewards',
    headerName: 'Net Rewards',
    align: 'right',
  }
]
