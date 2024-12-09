import React from 'react'
import { getClient } from '@/app/config/apollo/rsc'
import { gatewayByIdDocument } from '@/app/gateway/[id]/operations'
import GatewayDetail from '@/app/gateway/[id]/Detail'

export default async function GatewayLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>
}>) {
  const {id} = await params

  const {data} = await getClient().query({
    query: gatewayByIdDocument,
    variables: {
      id
    }
  })

  return (
    <GatewayDetail initialData={data} id={id} page={children} />
  )
}
