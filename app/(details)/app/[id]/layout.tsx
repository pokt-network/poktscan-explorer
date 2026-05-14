import React from 'react'
import TitleEntity from '@/app/components/TitleEntity'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import AppDetail from '@/app/(details)/app/[id]/Detail'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

const rpcUrl = getPublicRpcUrl()

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
      <AppDetail id={id} rpcUrl={rpcUrl} />
      {children}
    </div>
  )
}
