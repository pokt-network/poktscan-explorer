import React, { Suspense } from 'react'
import { getClient } from '@/app/config/apollo/rsc'
import { gatewayByIdDocument } from '@/app/gateway/[id]/operations'
import GatewayDetail from '@/app/gateway/[id]/Detail'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/gateway/[id]/rows'

async function ServerGatewayLayout({id}: Readonly<{
  id: string
}>) {
  const {data} = await getClient().query({
    query: gatewayByIdDocument,
    variables: {
      id
    }
  })

  return (
    <GatewayDetail initialData={data} id={id} />
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
