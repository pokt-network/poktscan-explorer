import { Transaction } from '@/app/config/gql/graphql'
import { formatBalance } from '@/app/utils/balances'
import Table, { GridColDef, TableProps } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'

export interface RowTransaction {
  id: string
  result: 0 | 1
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
}

export default function TransactionTable({rawRows, includeSigner = true, pagination}: TransactionTableProps) {
  const rows: Array<RowTransaction> = rawRows.map((transaction) => {
    const sendMessageString = transaction.messages!.nodes.find((msg) => msg!.typeUrl === '/cosmos.bank.v1beta1.MsgSend')

    let sendMessage

    if (sendMessageString) {
      sendMessage = JSON.parse(sendMessageString.json!)
    }

    return {
      id: transaction.id,
      result: transaction.code === 0 ? 0 : 1,
      messages: transaction.messages!.nodes.map((msg) => msg!.typeUrl.split('.').at(-1).replace('Msg', '')),
      height: Number(transaction.block!.height),
      timestamp: transaction.block!.timestamp!,
      amount: sendMessage?.amount?.length ? formatBalance(sendMessage.amount.at(0)) : '-',
      fee: formatBalance(transaction.fees!.at(0) || {
        amount: '0',
        denom: 'upokt'
      }),
      signer: transaction.signerAddress!
    }
  })

  const columns: Array<GridColDef> = [
    {
      field: 'id',
      headerName: 'Tx Hash',
      maxWidth: 200,
      renderCell: (cell: RowTransaction) => (
        <EntityLink
          entity={'tx'}
          entityId={cell.id}
          copy={{
            enabled: true,
            tooltip: 'Copy transaction hash'
          }}
        />
      )
    },
    {
      field: 'result',
      headerName: 'Result',
      renderCell: (cell: RowTransaction) => (
        <p className={`text-[color:--success] ${cell.result === 1 ? 'text-[color:--error]' : ''}`}>
          {cell.result === 1 ? 'Failed' : 'Success'}
        </p>
      )
    },
    {
      field: 'messages',
      headerName: 'Messages',
      renderCell: (cell: RowTransaction) => (
        <div className={"flex flex-row grow gap-1.5 items-center"}>
          <div className={"flex flex-row items-center justify-center gap-1 bg-[color:--background] px-4 py-1 rounded-lg border border-[color:--divider]"}>
            <p className={"whitespace-nowrap overflow-hidden overflow-ellipsis text-xs"}>
              {cell.messages.at(0) || 'Unknown'}
            </p>
          </div>
          {cell.messages.length > 1 && (
            <p className={"text-[color:--secondary] text-xs font-semibold"}>
              +{cell.messages.length - 1}
            </p>
          )}
        </div>
      )
    },
    {
      field: 'height',
      headerName: 'Height',
      renderCell: (cell: RowTransaction) => (
        <EntityLink
          entity={'block'}
          entityId={cell.height}
          copy={{
            enabled: true
          }}
        />
      )
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      maxWidth: 140,
    },
    {
      field: 'amount',
      headerName: 'Amount',
    },
    {
      field: 'fee',
      headerName: 'Fee',
    }
  ]

  if (includeSigner) {
    columns.splice(2,0, {
      description: 'Address of the first signer of the transaction',
      field: 'signer',
      headerName: 'Signer',
      maxWidth: 150,
      renderCell: (cell: RowTransaction) => (
        <EntityLink
          entity={'account'}
          entityId={cell.signer}
          copy={{
            enabled: true
          }}
        />
      )
    },)
  }

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: 'Transactions',
        subtitle: 'Transactions'
      }}
      pagination={pagination}
    />
  )
}
