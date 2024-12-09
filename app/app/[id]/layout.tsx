import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import { appByIdDocument } from '@/app/app/[id]/operations'
import AppDetail from '@/app/app/[id]/Detail'

export default async function AppLayout({children, params}: {
  children: React.ReactNode
  params: Promise<{id: string}>
}) {
  const {id} = await params

  const {data} = await getClient().query({
    query: appByIdDocument,
    variables: {
      id
    }
  })

  return (
    <AppDetail initialData={data} id={id} page={children} />
  )
}
