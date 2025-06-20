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
    headerName: 'Amount of Claims',
    align: 'right',
  },
  {
    field: 'claimRelays',
    headerName: 'Relays of Claims',
    align: 'right',
  },
  {
    field: 'claimComputedUnits',
    headerName: 'Comp. Units of Claims',
    align: 'right',
  },
  {
    field: 'claimPokt',
    headerName: 'POKT of Claims',
    align: 'right',
  },
  {
    field: 'proofAmount',
    headerName: 'Amount of Proofs',
    align: 'right',
  },
  {
    field: 'proofRelays',
    headerName: 'Relays of Proofs',
    align: 'right',
  },
  {
    field: 'proofComputedUnits',
    headerName: 'Comp. Units of Proofs',
    align: 'right',
  },
  {
    field: 'proofPokt',
    headerName: 'POKT of Proofs',
    align: 'right',
  },
]

export default columns
