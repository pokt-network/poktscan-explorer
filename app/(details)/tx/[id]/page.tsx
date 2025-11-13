import TransactionTabs from '@/app/(details)/tx/[id]/Tabs'
import { PageProps } from '@/app/types/pages'

export const dynamic = "force-dynamic";

export default async function TransactionDetailPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: PageProps) {
  const [params, searchParams] = await Promise.all([
    paramsPromise,
    searchParamsPromise
  ])

  const id = params.id as string
  const tab = searchParams['tab']?.toString() || 'messages'

  return (
    <TransactionTabs hash={id} tab={tab} rpcUrl={process.env.RPC_BASE_URL} />
  )
}
