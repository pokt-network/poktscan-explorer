import React, { ReactNode } from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import AccountDetail from '@/app/(details)/account/[id]/Detail'

const rpcUrl = process.env.RPC_BASE_URL!

export default async function AccountLayout({children, params}: {
  children: ReactNode
  params: Promise<{id: string}>
}) {
  const {id} = await params

  if (!isValidPoktAddress(id)) {
    return <NotFound />
  }

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Account'} text={id} />
      <AccountDetail id={id} rpcUrl={rpcUrl} />
      {children}
    </div>
  )
}
