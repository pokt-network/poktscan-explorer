import AppPageClient from '@/app/(details)/app/[id]/PageClient'

export default async function AppPage() {
  return (
    <AppPageClient rpcUrl={process.env.RPC_BASE_URL} />
  )
}
