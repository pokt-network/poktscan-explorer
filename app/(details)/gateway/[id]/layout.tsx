import React, { Suspense } from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/(details)/gateway/[id]/rows'
import getGateway from '@/app/(details)/gateway/[id]/getGateway'
import { getClient } from '@/app/config/apollo/rsc'
import GatewayDetail from '@/app/(details)/gateway/[id]/Detail'

const rpcUrl = process.env.RPC_BASE_URL!

async function ServerGatewayLayout({id}: Readonly<{
  id: string
}>) {
  const props = await getGateway(id, rpcUrl, getClient())

  return (
    <GatewayDetail id={id} rpcUrl={rpcUrl} {...props} />
  )
}

export default async function GatewayLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>;
}>) {
  const { id } = await params

  if (!isValidPoktAddress(id)) {
    return <NotFound />
  }

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Gateway'} text={id} />
      <Suspense
        key={id}
        fallback={
          <EntityDetail items={getRows(null, true)} />
        }
      >
        <ServerGatewayLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
