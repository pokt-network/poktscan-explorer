import GatewayPageClient from '@/app/(details)/gateway/[id]/PageClient'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

export default async function GatewayDetailPage() {
  return (
    <GatewayPageClient rpcUrl={getPublicRpcUrl()} />
  )
}
