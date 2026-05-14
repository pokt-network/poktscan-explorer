import AppPageClient from '@/app/(details)/app/[id]/PageClient'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

export default async function AppPage() {
  return (
    <AppPageClient rpcUrl={getPublicRpcUrl()} />
  )
}
