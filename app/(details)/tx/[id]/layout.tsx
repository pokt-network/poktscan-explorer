import React, { Suspense } from 'react'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/(details)/tx/[id]/rows'
import { isValidHash } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import TransactionDetail from '@/app/(details)/tx/[id]/Detail'
import { getTransaction } from '@/app/(details)/tx/[id]/getTx'
import { getClient } from '@/app/config/apollo/rsc'

const rpcUrl = process.env.RPC_BASE_URL!

async function ServerTxLayout({id}: {
  id: string
}) {
  const data = await getTransaction(id, rpcUrl, getClient())

  return (
    <TransactionDetail hash={id} rpcUrl={rpcUrl} {...data} />
  )
}

export default async function TxLayout({params, children}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const {id} = await params

  if (!isValidHash(id)) {
    return <NotFound />
  }

  return (
    <div className={'px-3 py-5 md:px-4 gap-4 flex flex-col'}>
      <TitleEntity title={'Tx'} text={id} />
      <Suspense
        fallback={
          <EntityDetail items={getRows(null, true)} />
        }
      >
        <ServerTxLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
