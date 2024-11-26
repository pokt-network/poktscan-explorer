import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { formatAmount } from '@/app/utils/format'

const transfersByAddressDocument = graphql(`
  query transfersList($limit: Int!, $offset: Int!, $address: String!) {
    transfers:nativeTransfers(
      first: $limit
      offset: $offset
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
          height
          timestamp
        }
        transaction {
          id
          fees
          gasUsed
          gasWanted
          code
        }
      }
    }
  }
`);

interface RowTransfer {
  id: string
  result: string
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

export default async function TransferTable({address, page, itemsPerPage, basePath}: TransferTableProps) {
  let { data } = await getClient().query({
    query: transfersByAddressDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      address,
    }
  })

  const totalPages = Math.ceil((data.transfers?.totalCount || 0) / itemsPerPage)

  if (page > totalPages && totalPages > 0) {
    page = 1

    const result = await getClient().query({
      query: transfersByAddressDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        address,
      }
    })

    data = result.data
  }

  const rows = data?.transfers?.nodes?.map((transfer) => ({
    id: transfer?.transaction?.id,
    result: transfer?.transaction?.code === 0 ? 'Success' : 'Failed',
    height: transfer?.block?.height,
    timestamp: transfer?.block?.timestamp,
    from: transfer?.senderId,
    flow: transfer?.senderId === address ? 'OUT' : 'IN',
    to: transfer?.recipientId,
    amount: formatAmount(transfer?.amounts?.at(0)),
    fee: formatAmount(transfer?.transaction?.fees?.at(0) || {
      amount: '0',
      denom: 'upokt'
    }),
  } as RowTransfer)) || []

  const columns: Array<GridColDef> = [
    {
      field: 'id',
      headerName: 'Tx Hash',
      maxWidth: 200,
      renderCell: (cell: RowTransfer) => (
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
      renderCell: (cell: RowTransfer) => (
        <p className={`text-[color:--success] ${cell.result === 'Failed' ? 'text-[color:--error]' : ''}`}>
          {cell.result}
        </p>
      )
    },
    {
      field: 'height',
      headerName: 'Height',
      renderCell: (cell: RowTransfer) => (
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
      description: 'Address of the sender',
      field: 'from',
      headerName: 'From',
      maxWidth: 150,
      renderCell: (cell: RowTransfer) => (
        <EntityLink
          entity={'account'}
          entityId={cell.from}
          copy={{
            enabled: true
          }}
        />
      )
    },
    {
      field: 'flow',
      headerName: '',
      maxWidth: 52,
      minWidth: 52,
      width: 52,
      renderCell: (cell: RowTransfer) => {
        return (
          <span className={`text-[10px] px-[7px] leading-[22px] pt-[1px] font-bold w-[36px] text-center rounded-sm border ${cell.flow === 'IN' ? 'border-[color:--success] text-[color:--success] bg-[color:--success-background]' : 'border-[color:--warning] text-[color:--warning] bg-[color:--warning-background]'} inline-block`}>
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
        <EntityLink
          entity={'account'}
          entityId={cell.to}
          copy={{
            enabled: true
          }}
        />
      )
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

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data.transfers?.totalCount} transfers found`,
      }}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath
      }}
    />
  )
}
