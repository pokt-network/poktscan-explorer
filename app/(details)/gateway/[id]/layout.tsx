import React from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import GatewayDetail from '@/app/(details)/gateway/[id]/Detail'

const rpcUrl = process.env.RPC_BASE_URL!

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
      <GatewayDetail id={id} rpcUrl={rpcUrl} />
      {children}
    </div>
  )
}
