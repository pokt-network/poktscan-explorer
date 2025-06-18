import { getClient } from '@/app/config/apollo/rsc'
import React, { Suspense } from 'react'
import ServiceDetail from '@/app/service/[id]/Detail'
import { serviceByIdDocument } from '@/app/service/[id]/operations'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/service/[id]/rows'

async function ServerServiceLayout({id}: Readonly<{
  id: string
}>) {
  const {data} = await getClient().query({
    query: serviceByIdDocument,
    variables: {
      id
    }
  })

  return (
    <ServiceDetail initialData={data} id={id} />
  )
}

export default async function ServiceLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>;
}>) {
  const {id} = await params

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Service'} text={id} />
      <Suspense
        key={id}
        fallback={
          <EntityDetail items={getRows(null, true)} />
        }
      >
        <ServerServiceLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
