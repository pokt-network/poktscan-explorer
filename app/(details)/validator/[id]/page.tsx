import ValidatorPageClient from '@/app/(details)/validator/[id]/PageClient'
import { PageProps } from '@/app/types/pages'

export default async function ValidatorDetailPage({
  params: paramsPromise,
}: PageProps) {
  const params = await paramsPromise
  const id = params.id as string

  return (
    <ValidatorPageClient id={id} rpcUrl={process.env.RPC_BASE_URL} />
  )
}
