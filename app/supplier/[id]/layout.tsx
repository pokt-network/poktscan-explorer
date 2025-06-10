import { getClient } from '@/app/config/apollo/rsc'
import React, { Suspense } from 'react'
import { supplierByIdDocument } from '@/app/supplier/[id]/operations'
import SupplierDetail from '@/app/supplier/[id]/Detail'
import EntityDetail from '@/app/components/EntityDetail'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import getRows from '@/app/supplier/[id]/rows'

async function ServerSupplierLayout({id}: Readonly<{
  id: string
}>) {
  const {data} = await getClient().query({
    query: supplierByIdDocument,
    variables: {
      id
    }
  })

  return (
    <SupplierDetail initialData={data} id={id} />
  )
}

export default async function SupplierLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>;
}>) {
  const {id} = await params

  if (!isValidPoktAddress(id)) {
    return <NotFound />
  }

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Supplier'} text={id} />
      <Suspense
        fallback={
          <EntityDetail items={getRows(null, true)} />
        }
      >
        <ServerSupplierLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
