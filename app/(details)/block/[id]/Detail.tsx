'use client'

import { getRows } from '@/app/(details)/block/[id]/utils'
import React from 'react'
import TitleEntity from '@/app/components/TitleEntity'
import getBlock, { GetBlockResult } from '@/app/(details)/block/[id]/getBlock'
import { useApolloClient } from '@apollo/client'
import ErrorBoundary from '@/app/components/ErrorBoundary'
import EntityDetail from '@/app/components/EntityDetail'
import { getSourceChipsRow } from '@/app/components/SourceChips'

interface BlockDetailProps extends GetBlockResult {
  id: string
  rpcUrl: string
}

export default function BlockDetail({id, rpcUrl, error, source, data,}: BlockDetailProps) {
  const client = useApolloClient()

  if (error) {
    return (
      <div className="h-[162px] w-full flex">
        <ErrorBoundary
          getProps={async () => {
            const res = await getBlock(id, rpcUrl, client)
            return {
              id,
              rpcUrl,
              ...res,
            }
          }}
          RenderElement={BlockDetail}
          fallback={
            <EntityDetail items={getRows(null, true)} />
          }
        />
      </div>
    )
  }

  return (
    <>
      <TitleEntity title={'Block'} text={'#' + id} />
      <EntityDetail
        items={[
          ...(source ? [getSourceChipsRow(source)] : []),
          ...getRows(data)
        ]}
      />
    </>
  )
}
