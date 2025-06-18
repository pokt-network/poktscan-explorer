'use client'

import BaseDetail from '@/app/components/BaseDetail'
import React from 'react'
import getApp, { GetAppResult, parseAppFromIndexer } from '@/app/(details)/app/[id]/getApp'
import { appByIdDocument } from '@/app/(details)/app/[id]/operations'
import getRows from '@/app/(details)/app/[id]/rows'

interface AppDetailProps extends GetAppResult {
  id: string
  rpcUrl: string
}

export default function AppDetail({
  id,
  rpcUrl,
  source,
  height,
  error,
  data
}: AppDetailProps) {
  return (
    <BaseDetail
      id={id}
      source={source}
      rpcUrl={rpcUrl}
      height={height}
      initialData={data}
      error={error}
      graphqlDocument={appByIdDocument}
      resultParser={parseAppFromIndexer}
      fetchFunction={getApp}
      getRows={getRows}
      SelfComponent={AppDetail}
      showNotFoundForMissingData={true}
    />
  )
}
