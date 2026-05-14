import AccountPageClient from '@/app/(details)/account/[id]/PageClient'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

export default async function AccountDetailPage() {
  return (
    <AccountPageClient rpcUrl={getPublicRpcUrl()} />
  )
}
