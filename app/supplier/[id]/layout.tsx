import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import { supplierByIdDocument } from '@/app/supplier/[id]/operations'
import SupplierDetail from '@/app/supplier/[id]/Detail'

export default async function RootLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>;
}>) {
  const {id} = await params

  const {data} = await getClient().query({
    query: supplierByIdDocument,
    variables: {
      id
    }
  })

  return (
    <SupplierDetail initialData={data} id={id} page={children} />
  )
}
