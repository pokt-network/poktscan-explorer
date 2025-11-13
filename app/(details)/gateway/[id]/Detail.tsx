'use client'

import getGateway from '@/app/(details)/gateway/[id]/getGateway'
import BaseDetail from '@/app/components/BaseDetail'
import getRows from '@/app/(details)/gateway/[id]/rows'

interface GatewayServiceDetailProps {
  id: string
  rpcUrl: string
}

export default function GatewayDetail({id, rpcUrl}: GatewayServiceDetailProps) {
  return (
    <BaseDetail
      id={id}
      rpcUrl={rpcUrl}
      fetchFunction={getGateway}
      getRows={getRows}
      showNotFoundForMissingData={true}
      entity={'gateway'}
      pollInterval={30 * 1000}
    />
  )
}
