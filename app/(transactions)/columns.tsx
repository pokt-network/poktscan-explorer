import type { GridColDef } from '@/app/components/Table'
import type { RowTransaction } from '@/app/(transactions)/TransactionTable'
import React from 'react'
import FailedTransactionFeedback from '@/app/(transactions)/FailedTransactionFeedback'
import EntityLink from '@/app/components/EntityLink'
import { ChipText } from '@/app/components/Chip'
import DateColumn from '../dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'

export function getTransactionsColumns(includeSigner = true): Array<GridColDef> {
  const columns: Array<GridColDef> = [
    {
      field: 'id',
      headerName: 'Tx Hash',
      maxWidth: 210,
      renderCell: (cell: RowTransaction) => (
        <div className={'flex min-w-0 flex-row items-center gap-[6px]'}>
          {cell.result !== 0 && (
            <FailedTransactionFeedback
              text={`Transaction failed with code ${cell.result}${cell.codespace ? ` and codespace: ${cell.codespace}` : ''}`}
            />
          )}
          <div className={'text-xs md:text-sm flex grow min-w-0'}>
            <EntityLink
              entity={'tx'}
              entityId={cell.id}
              copy={{
                enabled: true,
                tooltip: 'Copy transaction hash',
              }}
            />
          </div>
        </div>
      )
    },
    {
      field: 'messages',
      headerName: 'Messages',
      renderCell: (cell: RowTransaction) => (
        <ChipText moreElements={cell.totalMessages ? cell.totalMessages - 1 : 0}>
          {cell.firstMessage}
        </ChipText>
      ),
    },
    {
      field: 'height',
      headerName: 'Height',
      minWidth: 50,
      renderCell: (cell: RowTransaction) => cell.height ? (
        <div className={'text-xs md:text-sm'}>
          <EntityLink
            entity={'block'}
            entityId={cell.height}
            copy={{
              enabled: true
            }}
          />
        </div>
      ) : '-'
    },
    {
      field: 'timestamp',
      headerName: <DateColumn />,
      width: 180,
      align: 'center',
      renderCell: (cell: RowTransaction) => cell.timestamp ? (
        <div className={'text-xs md:text-sm'}>
          <DateCellText value={cell.timestamp} />
        </div>
      ) : null
    },
    {
      field: 'amount',
      headerName: 'Amount',
      align: 'right',
    },
    {
      field: 'fee',
      headerName: 'Fee',
      align: 'right',
    }
  ]

  if (includeSigner) {
    columns.splice(2,0, {
      description: 'Address of the first signer of the transaction',
      field: 'signer',
      headerName: 'Signer',
      maxWidth: 190,
      renderCell: (cell: RowTransaction) => (
        <div className={'text-xs md:text-sm'}>
          <EntityLink
            entity={'account'}
            entityId={cell.signer}
            copy={{
              enabled: true
            }}
          />
        </div>
      )
    },)
  }

  return columns
}
