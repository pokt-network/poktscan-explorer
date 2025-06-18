import React, { Suspense } from 'react'
import BlockDetail from '@/app/(details)/block/[id]/Detail'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import { getRows } from '@/app/(details)/block/[id]/utils'
import getBlock from './getBlock'
import { getClient } from '@/app/config/apollo/rsc'

const rpcUrl = process.env.RPC_BASE_URL!

async function ServerBlockLayout({id}: Readonly<{
  id: string
}>) {
  const props = await getBlock(id, rpcUrl, getClient())

  return (
    <BlockDetail id={id} rpcUrl={rpcUrl} {...props} />
  )
}

export default async function BlockLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>
}>) {
  const {id} = await params

  return (
    <div className={'px-3 py-5 md:px-4 gap-4 flex flex-col'}>
      <Suspense
        key={id}
        fallback={
          <>
            <TitleEntity title={'Block'} text={'#'} />
            <EntityDetail
              items={getRows(null, true)}
            />
          </>
        }
      >
        <ServerBlockLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
