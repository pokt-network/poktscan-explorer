import { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'

export interface DataByDelegatorRow {
  delegatorAddress: string
  slashed: string

  proofPokt: string
  proofRelays: string
  proofComputedUnits: string
  proofAmount: string

  claimPokt: string
  claimRelays: string
  claimComputedUnits: string
  claimAmount: string
}

const columns: Array<GridColDef> = [
  {
    field: 'delegatorAddress',
    headerName: 'Delegator',
    minWidth: 100,
    renderCell: (row: DataByDelegatorRow) => (
      <EntityLink entity={'account'} entityId={row.delegatorAddress} />
    )
  },
  {
    field: 'slashed',
    headerName: 'Slashed',
    align: 'right',
  },
  {
    field: 'claimAmount',
    headerName: '# Claims',
    align: 'right',
  },
  {
    field: 'claimRelays',
    headerName: 'Claims Relays',
    align: 'right',
  },
  {
    field: 'claimComputedUnits',
    headerName: 'Claims C. Units',
    align: 'right',
  },
  {
    field: 'claimPokt',
    headerName: 'Claims POKT',
    align: 'right',
  },
  {
    field: 'proofAmount',
    headerName: '# Proofs',
    align: 'right',
  },
  {
    field: 'proofRelays',
    headerName: 'Proofs Relays',
    align: 'right',
  },
  {
    field: 'proofComputedUnits',
    headerName: 'Proofs C. Units',
    align: 'right',
  },
  {
    field: 'proofPokt',
    headerName: 'Proofs POKT',
    align: 'right',
  },
]

export default columns
