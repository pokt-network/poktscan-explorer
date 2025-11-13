'use client'

import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import { validatorByIdDocument } from '@/app/(details)/validator/[id]/operations'
import { isValidPoktAddress, VALIDATOR_PREFIX } from '@/app/utils/poktroll'
import ValidatorDelegatorsTable from '@/app/(details)/validator/[id]/Delegators/Table'
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

interface ValidatorPageClientProps {
  id: string
  rpcUrl?: string
}

export default function ValidatorPageClient({ id, rpcUrl }: ValidatorPageClientProps) {
  const [signerId, setSignerId] = useState<string>(id)

  const { data } = useQuery(validatorByIdDocument, {
    variables: { id }
  })

  useEffect(() => {
    if (data?.validator?.signer?.id) {
      setSignerId(data.validator.signer.id)
    }
  }, [data])

  if (!isValidPoktAddress(id) || !id.startsWith(VALIDATOR_PREFIX)) {
    return null
  }

  return (
    <TransferAndTxTabs
      entity={'validator'}
      defaultTab={'delegators'}
      addressOverride={signerId}
      rpcUrl={rpcUrl}
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
            return <ValidatorDelegatorsTable valoperAddress={id} />
          }
        }
      }}
    />
  )
}
