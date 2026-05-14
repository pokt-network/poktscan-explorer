import ServiceTabs from '@/app/(details)/service/[id]/Tabs'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

export default async function ServicePage() {
  return (
    <ServiceTabs rpcUrl={getPublicRpcUrl()} />
  )
}
