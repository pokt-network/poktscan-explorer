import React, { ReactNode, Suspense } from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/(details)/account/[id]/rows'
import getAccount from '@/app/(details)/account/[id]/getAccount'
import { getClient } from '@/app/config/apollo/rsc'
import AccountDetail from '@/app/(details)/account/[id]/Detail'

const rpcUrl = process.env.RPC_BASE_URL!

async function ServerAccountLayout({id}: {
  id: string
}) {
  const data = await getAccount(id, rpcUrl, getClient())

  return (
    <AccountDetail id={id} rpcUrl={rpcUrl} {...data} />
  )
}

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
      <Suspense
        key={id}
        fallback={
          <EntityDetail items={getRows(null, true)} />
        }
      >
        <ServerAccountLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
