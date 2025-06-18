'use client'

import React from 'react'
import { serviceByIdDocument } from '@/app/(details)/service/[id]/operations'
import getRows, { parseServiceFromIndexer } from '@/app/(details)/service/[id]/rows'
import GetService, { GetServiceResult } from '@/app/(details)/service/[id]/getService'
import BaseDetail from '@/app/components/BaseDetail'

interface ServiceDetailProps extends GetServiceResult {
  id: string
  rpcUrl: string
}

export default function ServiceDetail({id, source, data: initialData, error, height, rpcUrl}: ServiceDetailProps) {
  return (
    <BaseDetail
      id={id}
      source={source}
      rpcUrl={rpcUrl}
      height={height}
      initialData={initialData}
      error={error}
      graphqlDocument={serviceByIdDocument}
      resultParser={parseServiceFromIndexer}
      fetchFunction={GetService}
      getRows={getRows}
      SelfComponent={ServiceDetail}
      showNotFoundForMissingData={true}
   />
  )
}
