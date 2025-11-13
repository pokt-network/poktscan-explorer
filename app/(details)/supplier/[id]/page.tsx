import SupplierPageClient from '@/app/(details)/supplier/[id]/PageClient'

export default async function SupplierPage() {
  return (
    <SupplierPageClient rpcUrl={process.env.RPC_BASE_URL} />
  )
}
