import { getClient } from '@/app/config/apollo/rsc'
import React, { Suspense } from 'react'
import ServiceDetail from '@/app/(details)/service/[id]/Detail'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/(details)/service/[id]/rows'
import GetService from '@/app/(details)/service/[id]/getService'

const rpcUrl = process.env.RPC_BASE_URL!

async function ServerServiceLayout({id}: Readonly<{
  id: string
}>) {
  const getServiceProps = await GetService(id, rpcUrl, getClient())

  return (
    <ServiceDetail id={id} rpcUrl={rpcUrl} {...getServiceProps} />
  )
}

export default async function ServiceLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>;
}>) {
  const {id} = await params

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Service'} text={id} />
      <Suspense
        key={id}
        fallback={
          <EntityDetail items={getRows(null, true)} />
        }
      >
        <ServerServiceLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
