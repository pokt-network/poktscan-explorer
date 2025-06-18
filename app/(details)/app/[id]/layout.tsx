import React, { Suspense } from 'react'
import TitleEntity from '@/app/components/TitleEntity'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/(details)/app/[id]/rows'
import getApp from '@/app/(details)/app/[id]/getApp'
import { getClient } from '@/app/config/apollo/rsc'
import AppDetail from '@/app/(details)/app/[id]/Detail'

const rpcUrl = process.env.RPC_BASE_URL!

async function ServerAppLayout({id}: {
  id: string
}) {
  const data = await getApp(id, rpcUrl, getClient())

  return (
    <AppDetail id={id} rpcUrl={rpcUrl} {...data} />
  )
}

export default async function AppLayout({children, params}: {
  children: React.ReactNode
  params: Promise<{id: string}>
}) {
  const {id} = await params

  if (!isValidPoktAddress(id)) {
    return <NotFound />
  }

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Application'} text={id} />
      <Suspense
        key={id}
        fallback={
          <EntityDetail items={getRows(null, true)} />
        }
      >
        <ServerAppLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
