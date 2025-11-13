import BlockTabs from '@/app/(details)/block/[id]/Tabs'

export default async function BlockDetailPage() {
  return (
    <BlockTabs rpcUrl={process.env.RPC_BASE_URL} />
  )
}
