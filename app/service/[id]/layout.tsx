import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import ServiceDetail from '@/app/service/[id]/Detail'
import { serviceByIdDocument } from '@/app/service/[id]/operations'

export default async function RootLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>;
}>) {
  const {id} = await params

  const {data} = await getClient().query({
    query: serviceByIdDocument,
    variables: {
      id
    }
  })

  return (
    <ServiceDetail initialData={data} id={id} page={children} />
  )
}
