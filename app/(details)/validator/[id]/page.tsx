import ValidatorPageClient from '@/app/(details)/validator/[id]/PageClient'
import { PageProps } from '@/app/types/pages'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

export default async function ValidatorDetailPage({
  params: paramsPromise,
}: PageProps) {
  const params = await paramsPromise
  const id = params.id as string

  return (
    <ValidatorPageClient id={id} rpcUrl={getPublicRpcUrl()} />
  )
}
