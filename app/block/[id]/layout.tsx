import React, { Suspense } from 'react'
import BlockDetail from '@/app/block/[id]/Detail'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import { getRows } from '@/app/block/[id]/utils'

export default async function BlockLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>
}>) {
  const {id} = await params

  return (
    <div className={'px-3 py-5 md:px-4 gap-4 flex flex-col'}>
      <Suspense
        key={id}
        fallback={
          <>
            <TitleEntity title={'Block'} text={'#'} />
            <EntityDetail
              items={getRows(null, true)}
            />
          </>
        }
      >
        <BlockDetail id={id} />
      </Suspense>
      {children}
    </div>
  )
}
