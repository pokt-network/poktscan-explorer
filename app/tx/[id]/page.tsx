import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import EntityLink from '@/app/components/EntityLink'
import React, { Suspense } from 'react'
import { formatAmount } from '@/app/utils/format'
import TitleEntity from '@/app/components/TitleEntity'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import NotFound from '@/app/not-found'
import RawEntity from '@/app/components/RawEntity/RawEntity'
import Messages, { DisplayMessages } from '@/app/tx/[id]/Messages'
import { Skeleton } from '@/components/ui/skeleton'
import { isValidHash } from '@/app/utils/poktroll'

export const dynamic = "force-dynamic";

const txByIdDocument = graphql(`
  query transaction($id: String!) {
    transaction(id: $id) {
      id
      code
      codespace
      block {
        timestamp
        height: id
      }
      gasUsed
      gasWanted
      signerAddress
      fees
      memo
      messages(orderBy: ID_ASC) {
        totalCount
        pageInfo {
          hasNextPage
          startCursor
          endCursor
        }
        nodes {
          typeUrl
          json
        }
      }
    }
  }
`)

function getRows(tx, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Signer',
      description: 'First signer of the transaction',
      value: skeleton || (
        <div className={'text-sm'}>
          <EntityLink
            entity={'account'}
            entityId={tx.signerAddress}
            copy={{
              enabled: true
            }}
          />
        </div>
      )
    },
    {
      type: 'row',
      label: 'Status',
      value:  skeleton || (
        <div className={'flex flex-row items-center gap-2'}>
          <p className={`text-sm ${tx.code === 0 ? 'text-[color:--success]' : 'text-[color:--error]'} font-semibold`}>
            {tx.code === 0 ? 'Success' : 'Failed'}
          </p>
          {tx.code !== 0 && (
            <div className={'text-sm text-[color:--secondary] bg-[color:--background] border border-[color:--divider] px-4 py-1 rounded-md'}>
              code:{tx.code}
            </div>
          )}
        </div>
      )
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Height',
      value: skeleton ? skeleton : tx.block?.height ? (
        <div className={'text-sm'}>
          <EntityLink
            entity={'block'}
            entityId={tx.block?.height}
            copy={{
              enabled: true
            }}
          />
        </div>
      ) : '-'
    },
    {
      type: 'row',
      label: <DateColumn />,
      value: skeleton ? skeleton : tx.block?.timestamp ? (
        <div className={'text-sm'}>
          <DateCellText value={tx.block.timestamp} />
        </div>
      ) : '-'
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Gas Used / Wanted',
      value:  skeleton || `${tx.gasUsed} / ${tx.gasWanted}`
    },
    {
      type: 'row',
      label: 'Fee',
      value:  skeleton || formatAmount(tx.fees.at(0) || {
        amount: '0',
        denom: 'upokt',
        maxDecimals: 6
      })
    }
  ]

  if (!isLoading && tx.code !== 0) {
    rows.splice(2, 0, ...[
      {
        type: 'row',
        label: 'Code',
        value: tx.code
      },
      {
        type: 'row',
        label: 'Codespace',
        value: tx.codespace
      }
    ])
  }

  if (!isLoading && tx.memo) {
    rows.push({
      type: 'divider'
    },{
      type: 'row',
      label: 'Memo',
      value: (
        <p className={"text-sm text-[color:--foreground] break-all"}>
          {tx.memo}
        </p>
      )
    })
  }

  return rows
}

async function ServerTransactionDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = await params

  const {data} = await getClient().query({
    query: txByIdDocument,
    variables: {id}
  })

  const tx = data.transaction

  if (!tx) {
    return (
      <NotFound />
    )
  }

  const rows = getRows(tx)

  return (
    <>
      <EntityDetail
        items={rows}
      />
      <h2 className={'text-xl font-semibold'}>
        Messages [{tx.messages.totalCount}]
      </h2>
      <div
        className={'bg-[color:--main-background] p-4 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow'}>
        {tx.messages.totalCount <= tx.messages.nodes.length ? (
          <DisplayMessages
            messages={tx.messages.nodes}
          />
        ) : (
          <Suspense fallback={
            <div
              className={'bg-[color:--background] py-4 px-6 flex flex-col gap-4'}
            >
              <p className={'text-sm'}>Loading...</p>
            </div>
            }>
            <Messages
              transactionId={tx.id}
              initialMessages={tx.messages.nodes}
              initialCursor={tx.messages.pageInfo?.endCursor}
              totalMessages={tx.messages.totalCount}
            />
          </Suspense>
        )}
      </div>
      <h2 className={'text-xl font-semibold'}>
        Raw Result
      </h2>
      <RawEntity
        entity={'tx'}
        id={tx.id}
        loadOnClick={true}
      />
    </>
  )
}

export default async function TransactionDetailPage({params}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!isValidHash(id)) {
    return <NotFound />
  }

  return (
    <div className={'px-3 py-5 md:px-4 gap-4 flex flex-col'}>
      <TitleEntity title={'Tx'} text={id} />
      <Suspense
        key={id}
        fallback={
          <EntityDetail items={getRows(null, true)} />
        }
      >
        <ServerTransactionDetailPage params={params} />
      </Suspense>
    </div>
  )
}
