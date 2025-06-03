import { Transaction } from '@/app/config/gql/graphql'
import Table, { GridColDef, TableProps } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import { ChipText } from '@/app/components/Chip'
import FailedTransactionFeedback from '@/app/(transactions)/FailedTransactionFeedback'
import DateCellText from '@/app/dates/DateCellText'
import DateColumn from '@/app/dates/DateColumn'
import { graphql } from '@/app/config/gql'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'

export const transactionsSubscription = graphql(`
  subscription transactions {
    transactions {
      id
      _entity {
        id
        signerAddress
        #        todo: uncomment this when fixed
        #        messages {
        #          nodes {
        #            json
        #          }
        #        }
      }
    }
  }
`)

export interface RowTransaction {
  id: string
  result: number
  codespace?: string
  firstMessage: string
  totalMessages: number
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
  subtitle?: React.ReactNode
}

export default function TransactionTable({rawRows, includeSigner = true, pagination, totalItems, subtitle}: TransactionTableProps) {
  const rows: Array<RowTransaction> = rawRows.map((transaction) => {
    const sendMessageString = transaction.messages!.nodes.find((msg) => msg!.typeUrl === '/cosmos.bank.v1beta1.MsgSend')

    let sendMessage

    if (sendMessageString && transaction.messages!.nodes.length === 1) {
      sendMessage = JSON.parse(sendMessageString.json!)
    }

    const amount = sendMessage?.amount?.at(0)

    const fee = transaction.fees!.at(0) || {
      amount: '0',
      denom: 'upokt'
    }

    return {
      id: transaction.id || '',
      result: transaction.code,
      codespace: transaction.codespace,
      firstMessage: transaction?.messages?.nodes?.at(0)?.typeUrl?.split('.')?.at(-1)?.replace('Msg', '') || '',
      totalMessages: transaction?.messages?.totalCount || 0,
      height: Number(transaction?.block?.height || 0),
      timestamp: transaction?.block?.timestamp || '',
      amount: amount ? formatAmount(amount) : '-',
      raw_amount: amount ? convertUpoktToPokt(amount.amount) : '',
      fee: formatAmount(fee),
      raw_fee: convertUpoktToPokt(fee?.amount),
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

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${totalItems} transactions found`,
        subtitle: subtitle || (
          // @ts-expect-error tbd
          <NewEntitiesFound<typeof transactionsSubscription>
            entity={'transactions'}
            subscription={transactionsSubscription}
          />
        )
      }}
      pagination={pagination}
    />
  )
}
