'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { accountByIdDocument } from '@/app/account/[id]/operations'
import React, { useMemo } from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { formatAmount } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import TitleEntity from '@/app/components/TitleEntity'

interface AccountDetailProps {
  initialData: DocumentNodeData<typeof accountByIdDocument>
  id: string
  page: React.ReactNode
}

export default function AccountDetail({id, page, initialData}: AccountDetailProps) {
  const variables = useMemo(() => ({id}), [id])

  const data = useFetchOnBlock({
    query: accountByIdDocument,
    variables,
    initialResult: initialData
  })

  if (!data.account && !isValidPoktAddress(id)) {
    return (
      <NotFound />
    )
  }

  const { account } = data || {}

  const upoktBalance = account?.balances?.nodes?.find((item) => item?.denom === 'upokt')

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: formatAmount(upoktBalance || {amount: '0', denom: 'upokt'})
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Updated At Block',
      value: upoktBalance ? (
        <div className={"text-sm"}>
          <EntityLink entity={'block'} entityId={upoktBalance.lastUpdatedBlock!.height} copy={{enabled: true}}/>
        </div>
      ) : '-'
    },
    {
      type: 'row',
      label: <DateColumn />,
      value: upoktBalance ? (
        <div className={"text-sm"}>
          <DateCellText value={upoktBalance.lastUpdatedBlock!.timestamp} />
        </div>
      ) : '-'
    },
  ]

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Account'} text={account?.id || id} />
      <EntityDetail
        items={rows}
      />
      {page}
    </div>
  )
}
