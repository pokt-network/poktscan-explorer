import SupplierPageClient from '@/app/(details)/supplier/[id]/PageClient'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

export default async function SupplierPage() {
  return (
    <SupplierPageClient rpcUrl={getPublicRpcUrl()} />
  )
}
