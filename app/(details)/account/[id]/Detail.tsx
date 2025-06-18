'use client'
import getAccount, { GetAccountResult, parseAccountFromIndexer } from '@/app/(details)/account/[id]/getAccount'
import { accountByIdDocument } from '@/app/(details)/account/[id]/operations'
import getRows from '@/app/(details)/account/[id]/rows'
import BaseDetail from '@/app/components/BaseDetail'

interface AccountDetailResult extends GetAccountResult {
  id: string
  rpcUrl: string
}

export default function AccountDetail({id, source, rpcUrl, height, data: initialData, error}: AccountDetailResult) {
  return (
    <BaseDetail
      id={id}
      source={source}
      rpcUrl={rpcUrl}
      height={height}
      initialData={initialData}
      error={error}
      graphqlDocument={accountByIdDocument}
      resultParser={parseAccountFromIndexer}
      fetchFunction={getAccount}
      getRows={getRows}
      SelfComponent={AccountDetail}
    />
  )
}
