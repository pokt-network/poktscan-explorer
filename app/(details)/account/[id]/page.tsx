import AccountPageClient from '@/app/(details)/account/[id]/PageClient'

export default async function AccountDetailPage() {
  return (
    <AccountPageClient rpcUrl={process.env.RPC_BASE_URL} />
  )
}
