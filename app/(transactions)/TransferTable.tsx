'use client'

import { graphql } from '@/app/config/gql'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React, { useCallback } from 'react'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import FailedTransactionFeedback from '@/app/(transactions)/FailedTransactionFeedback'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import NewTransferByAddress from '@/app/(transactions)/NewTransferByAddress'
import LoadingListView from '@/app/components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

const transfersByAddressDocument = graphql(`
  query transfersList($limit: Int!, $offset: Int!, $address: String!) {
    transfers:nativeTransfers(
      first: $limit
      offset: $offset
      orderBy: BLOCK_ID_DESC
      filter: {
        or: [{ senderId: { equalTo: $address } }, { recipientId: { equalTo: $address } }]
      }
    ) {
      totalCount
      nodes {
        id
        senderId
        recipientId
        amounts
        denom
        block {
          height: id
          timestamp
        }
        transaction {
          id
          fees
          gasUsed
          gasWanted
          code
          codespace
        }
      }
    }
  }
`);

const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'Tx Hash',
    maxWidth: 200,
    renderCell: (cell: RowTransfer) => (
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
    field: 'height',
    headerName: 'Height',
    renderCell: (cell: RowTransfer) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'block'}
          entityId={cell.height}
        />
      </div>
    )
  },
  {
    field: 'timestamp',
    headerName: <DateColumn />,
    width: 180,
    align: 'center',
    renderCell: (cell: RowTransfer) => (
      <div className={'text-xs md:text-sm'}>
        <DateCellText value={cell.timestamp} />
      </div>
    )
  },
  {
    description: 'Address of the sender',
    field: 'from',
    headerName: 'From',
    maxWidth: 150,
    renderCell: (cell: RowTransfer) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'account'}
          entityId={cell.from}
          copy={{
            enabled: true
          }}
        />
      </div>
    )
  },
  {
    field: 'flow',
    headerName: '',
    maxWidth: 55,
    minWidth: 55,
    width: 55,
    renderCell: (cell: RowTransfer) => {
      return (
        <span className={`text-[10px] mx-[-6px] px-[7px] leading-[22px] pt-[1px] font-bold w-[36px] text-center rounded-sm border ${cell.flow === 'IN' ? 'border-[color:--success] text-[color:--success] bg-[color:--success-background]' : 'border-[color:--warning] text-[color:--warning] bg-[color:--warning-background]'} inline-block`}>
            {cell.flow}
          </span>
      )
    }
  },
  {
    description: 'Address of the recipient',
    field: 'to',
    headerName: 'To',
    maxWidth: 150,
    renderCell: (cell: RowTransfer) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'account'}
          entityId={cell.to}
          copy={{
            enabled: true
          }}
        />
      </div>
    )
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

interface RowTransfer {
  id: string
  result: number
  codespace?: string
  height: string
  timestamp: string
  from: string
  flow: string
  to: string
  amount: string
  fee: string
}

interface TransferTableProps {
  address: string
  page: number
  itemsPerPage: number
  basePath: string
}

export default function TransferTable({address, page, itemsPerPage, basePath}: TransferTableProps) {
  const variables = useCallback(() => ({
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
    address,
  }), [page, itemsPerPage, address])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: transfersByAddressDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof transfersByAddressDocument>,
    initialError: false
  })

  if (isLoading) {
    return (
      <LoadingListView
        columns={columns}
        rowsAmount={itemsPerPage}
      />
    )
  }

  if (error) {
    return (
      <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={'Oops. There was an error loading the transfers data.'}
        />
      </div>
    )
  }

  const rows = data?.transfers?.nodes?.map((transfer) => {
    const amount = transfer?.amounts?.at(0)
    const fee = transfer?.transaction?.fees?.at(0) || {
      amount: '0',
      denom: 'upokt'
    }

    return {
      id: transfer?.transaction?.id,
      result: transfer?.transaction?.code,
      codespace: transfer?.transaction?.codespace,
      height: transfer?.block?.height,
      timestamp: transfer?.block?.timestamp,
      // TODO: senderId and recipientId is incorrectly mapped in the indexer
      from: transfer?.recipientId,
      flow: transfer?.recipientId === address ? 'OUT' : 'IN',
      to: transfer?.senderId,
      amount: formatAmount(amount),
      raw_amount: convertUpoktToPokt(amount?.amount),
      fee: formatAmount(fee),
      raw_fee: convertUpoktToPokt(fee?.amount),
    }
  }) || []

  const totalPages = Math.ceil((data?.transfers?.totalCount || 0) / itemsPerPage)

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data?.transfers?.totalCount || 0} transfers found`,
        subtitle: (
          <NewTransferByAddress address={address} />
        )
      }}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath
      }}
      csvEndpoint={`/api/export/transfers?address=${address}`}
    />
  )
}
