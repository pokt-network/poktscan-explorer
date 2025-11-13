import React from 'react'
import { isValidHash } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import TransactionDetail from '@/app/(details)/tx/[id]/Detail'

const rpcUrl = process.env.RPC_BASE_URL!

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
      <TransactionDetail hash={id} rpcUrl={rpcUrl} />
      {children}
    </div>
  )
}
