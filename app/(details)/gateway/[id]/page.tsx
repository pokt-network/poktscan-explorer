import GatewayPageClient from '@/app/(details)/gateway/[id]/PageClient'

export default async function GatewayDetailPage() {
  return (
    <GatewayPageClient rpcUrl={process.env.RPC_BASE_URL} />
  )
}
