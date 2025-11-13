'use client'
import getAccount from '@/app/(details)/account/[id]/getAccount'
import getRows from '@/app/(details)/account/[id]/rows'
import BaseDetail from '@/app/components/BaseDetail'

interface AccountDetailResult {
  id: string
  rpcUrl: string
}

export default function AccountDetail({id, rpcUrl}: AccountDetailResult) {
  return (
    <BaseDetail
      id={id}
      rpcUrl={rpcUrl}
      fetchFunction={getAccount}
      getRows={getRows}
      entity={'account'}
      pollInterval={30 * 1000}
    />
  )
}
