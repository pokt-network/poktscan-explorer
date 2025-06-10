import React, { ReactNode, Suspense } from 'react'
import { getClient } from '@/app/config/apollo/rsc'
import { accountByIdDocument } from '@/app/account/[id]/operations'
import AccountDetail from '@/app/account/[id]/Detail'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/account/[id]/rows'

async function ServerAccountLayout({id}: {
  id: string
}) {
  const {data} = await getClient().query({
    query: accountByIdDocument,
    variables: {
      id
    }
  })

  return (
    <AccountDetail initialData={data} id={id} />
  )
}

export default async function AccountLayout({children, params}: {
  children: ReactNode
  params: Promise<{id: string}>
}) {
  const {id} = await params

  if (!isValidPoktAddress(id)) {
    return <NotFound />
  }

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Account'} text={id} />
      <Suspense
        key={id}
        fallback={
          <EntityDetail items={getRows(null, true)} />
        }
      >
        <ServerAccountLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
