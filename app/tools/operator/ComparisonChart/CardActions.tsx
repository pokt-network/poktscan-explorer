'use client'

import type { CsvColumn } from '@/app/utils/exportToCsv'
import type { Item } from '@/app/hooks/useClaimProofData'
import React from 'react'
import { convertUpoktToPokt } from '@/app/utils/format'
import ExportButton from '@/app/components/ExportButton'
import { useDataContext } from '@/app/context/DataContext'
import { containerId } from '@/app/tools/operator/constants'
import ScreenshotButton from '@/app/components/ScreenshotButton'

export const csvColumns: Array<CsvColumn> = [
  {
    field: 'start_date',
    headerName: 'Date',
  },
  {
    field: 'claim_amount',
    headerName: 'Claim Amount',
  },
  {
    field: 'claim_relays',
    headerName: 'Claim Relays',
  },
  {
    field: 'claim_computed_units',
    headerName: 'Claim Computed Units',
  },
  {
    field: 'claim_upokt',
    headerName: 'Claim POKT',
  },

  {
    field: 'proof_amount',
    headerName: 'Proof Amount',
  },
  {
    field: 'proof_relays',
    headerName: 'Proof Relays',
  },
  {
    field: 'proof_computed_units',
    headerName: 'Proof Computed Units',
  },
  {
    field: 'proof_upokt',
    headerName: 'Proof POKT',
  },

  {
    field: 'expired_proof_amount',
    headerName: 'Expired Proofs Amount',
  },
  {
    field: 'expired_proof_relays',
    headerName: 'Expired Proofs Relays',
  },
  {
    field: 'expired_proof_computed_units',
    headerName: 'Expired Proofs Computed Units',
  },
  {
    field: 'expired_proof_upokt',
    headerName: 'Expired Proofs POKT',
  },
]

export const formatterFunction = (field: keyof Item, row: Item) => {
  if (field.endsWith('_upokt')) {
    return convertUpoktToPokt(row[field]).toString()
  }

  return row[field].toString()
}

export default function ClaimProofsExpiredActions() {
  const {data} = useDataContext<Item>()

  return (
    <div className={'flex flex-row items-center gap-2'}>
      <ExportButton
        columns={csvColumns}
        formatterFunction={formatterFunction}
        fileNameKey={'operator_claim_proofs_expired'}
        rows={data}
      />
      <ScreenshotButton
        baseFileName={'operator_claim_proofs_expired'}
        nodeId={containerId}
      />
    </div>
  )
}
