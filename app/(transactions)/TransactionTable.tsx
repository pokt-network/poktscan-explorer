import { Transaction } from '@/app/config/gql/graphql'
import Table, { GridColDef, TableProps } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { formatAmount } from '@/app/utils/format'
import Chip from '@/app/components/Chip'
import FailedTransactionFeedback from '@/app/(transactions)/FailedTransactionFeedback'

export interface RowTransaction {
  id: string
  result: number
  codespace?: string
  messages: Array<string>
  height: number
  timestamp: string
  amount: string
  fee: string
  signer: string
}

interface TransactionTableProps {
  rawRows: Array<Partial<Transaction>>
  includeSigner?: boolean
  pagination: TableProps['pagination']
  totalItems?: number
}

export default function TransactionTable({rawRows, includeSigner = true, pagination, totalItems}: TransactionTableProps) {
  const rows: Array<RowTransaction> = rawRows.map((transaction) => {
    const sendMessageString = transaction.messages!.nodes.find((msg) => msg!.typeUrl === '/cosmos.bank.v1beta1.MsgSend')

    let sendMessage

    if (sendMessageString && transaction.messages!.nodes.length === 1) {
      sendMessage = JSON.parse(sendMessageString.json!)
    }

    return {
      id: transaction.id || '',
      result: transaction.code,
      codespace: transaction.codespace,
      messages: transaction?.messages?.nodes?.map((msg) => msg?.typeUrl?.split('.')?.at(-1)?.replace('Msg', '') || '') || [],
      height: Number(transaction.block!.height),
      timestamp: transaction.block!.timestamp!,
      amount: sendMessage?.amount?.length ? formatAmount(sendMessage.amount.at(0)) : '-',
      fee: formatAmount(transaction.fees!.at(0) || {
        amount: '0',
        denom: 'upokt'
      }),
      signer: transaction.signerAddress!,
    } as RowTransaction
  })

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
        <Chip values={cell.messages} />
      ),
    },
    {
      field: 'height',
      headerName: 'Height',
      minWidth: 50,
      renderCell: (cell: RowTransaction) => (
        <div className={'text-xs md:text-sm'}>
          <EntityLink
            entity={'block'}
            entityId={cell.height}
            copy={{
              enabled: true
            }}
          />
        </div>
      )
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      maxWidth: 180,
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

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${totalItems} transactions found`,
      }}
      pagination={pagination}
    />
  )
}
