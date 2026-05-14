import BlockTabs from '@/app/(details)/block/[id]/Tabs'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

export default async function BlockDetailPage() {
  return (
    <BlockTabs rpcUrl={getPublicRpcUrl()} />
  )
}
