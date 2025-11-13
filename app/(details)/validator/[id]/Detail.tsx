'use client'
import getValidator from '@/app/(details)/validator/[id]/getValidator'
import BaseDetail from '@/app/components/BaseDetail'
import getRows from '@/app/(details)/validator/[id]/rows'

interface ValidatorDetailProps {
  id: string
  rpcUrl: string
}

export default function ValidatorDetail({id, rpcUrl,}: ValidatorDetailProps) {
  return (
    <BaseDetail
      id={id}
      rpcUrl={rpcUrl}
      fetchFunction={getValidator}
      getRows={getRows}
      showNotFoundForMissingData={true}
      entity={'validator'}
      pollInterval={30 * 1000}
    />
  )

}
