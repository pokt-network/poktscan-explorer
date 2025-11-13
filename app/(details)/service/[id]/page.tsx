import ServiceTabs from '@/app/(details)/service/[id]/Tabs'

export default async function ServicePage() {
  return (
    <ServiceTabs rpcUrl={process.env.RPC_BASE_URL} />
  )
}
