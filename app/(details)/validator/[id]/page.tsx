import { Suspense } from 'react'
import { getClient } from '@/app/config/apollo/rsc'
import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import { validatorByIdDocument } from '@/app/(details)/validator/[id]/operations'
import { isValidPoktAddress, VALIDATOR_PREFIX } from '@/app/utils/poktroll'
import { LoadingTable } from '@/app/components/LoadingListView'
import
  ValidatorDelegatorsTable,
  {
    validatorDelegatorsColumns
  }
from '@/app/(details)/validator/[id]/Delegators/Table'

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ValidatorDetailPage({params, searchParams}: PageProps) {
  const {id} = await params

  if (!isValidPoktAddress(id) || !id.startsWith(VALIDATOR_PREFIX)) {
    return null
  }

  const {data} = await getClient().query({
    query: validatorByIdDocument,
    variables: {
      id
    }
  })

  // Transactions and transfer here are showing the signer address which is not the id of the validator.
  // Validators have a signer which is the owner of it, that owner is the one that can do transactions on behalf of it.
  const signerParams: Promise<{id: string}> = Promise.resolve({id: data?.validator?.signer?.id || id, idForUrl: id} as {id: string})

  return (
    <TransferAndTxTabs
      searchParams={searchParams}
      params={signerParams}
      entity={'validator'}
      defaultTab={'delegators'}
      moreTabs={{
        position: 'start',
        tabs: [
          {
            tab: 'delegators',
            label: 'Delegators',
          }
        ],
        getContent: (tab) => {
          if (tab === 'delegators') {
            return (
              <Suspense
                key={id}
                fallback={(
                  <LoadingTable columns={validatorDelegatorsColumns} rowsAmount={10} />
                )}
              >
                <ValidatorDelegatorsTable valoperAddress={id} />
              </Suspense>
            )
          }
        }
      }}
    />
  )
}
