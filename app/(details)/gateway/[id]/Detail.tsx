'use client'

import getGateway, { GetGatewayResult, parseGatewayFromIndexer } from '@/app/(details)/gateway/[id]/getGateway'
import BaseDetail from '@/app/components/BaseDetail'
import { gatewayByIdDocument } from '@/app/(details)/gateway/[id]/operations'
import getRows from '@/app/(details)/gateway/[id]/rows'

interface GatewayServiceDetailProps extends GetGatewayResult {
  id: string
  rpcUrl: string
}

export default function GatewayDetail({id, source, data: initialData, error, height, rpcUrl}: GatewayServiceDetailProps) {
  return (
    <BaseDetail
      id={id}
      source={source}
      rpcUrl={rpcUrl}
      height={height}
      initialData={initialData}
      error={error}
      graphqlDocument={gatewayByIdDocument}
      resultParser={parseGatewayFromIndexer}
      fetchFunction={getGateway}
      getRows={getRows}
      SelfComponent={GatewayDetail}
      showNotFoundForMissingData={true}
    />
  )
}
