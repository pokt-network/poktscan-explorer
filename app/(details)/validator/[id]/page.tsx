import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import { getClient } from '@/app/config/apollo/rsc'
import { validatorByIdDocument } from '@/app/(details)/validator/[id]/operations'

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ValidatorDetailPage({params, searchParams}: PageProps) {
  const {id} = await params

  const {data} = await getClient().query({
    query: validatorByIdDocument,
    variables: {
      id
    }
  })

  // Transactions and transfer here are showing the signer address which is not the id of the validator.
  // Validators have a signer which is the owner of it, that owner is the one that can do transactions on behalf of it.
  const signerParams: Promise<{id: string}> = Promise.resolve({id: data?.validator?.signer?.id, idForUrl: id} as {id: string})

  return (
    <TransferAndTxTabs searchParams={searchParams} params={signerParams} entity={'validator'}/>
  )
}
