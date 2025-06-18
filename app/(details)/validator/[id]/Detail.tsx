'use client'
import getValidator, { GetValidatorResult, parseValidatorFromIndexer } from '@/app/(details)/validator/[id]/getValidator'
import BaseDetail from '@/app/components/BaseDetail'
import { validatorByIdDocument } from '@/app/(details)/validator/[id]/operations'
import getRows from '@/app/(details)/validator/[id]/rows'

interface ValidatorDetailProps extends GetValidatorResult {
  id: string
  rpcUrl: string
}

export default function ValidatorDetail({id, rpcUrl, error, source, data, height}: ValidatorDetailProps) {
  return (
    <BaseDetail
      id={id}
      source={source}
      rpcUrl={rpcUrl}
      height={height}
      initialData={data}
      error={error}
      graphqlDocument={validatorByIdDocument}
      resultParser={parseValidatorFromIndexer}
      fetchFunction={getValidator}
      getRows={getRows}
      SelfComponent={ValidatorDetail}
      showNotFoundForMissingData={true}
    />
  )

}
