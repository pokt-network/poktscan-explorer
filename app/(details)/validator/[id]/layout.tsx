import React, { Suspense } from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/(details)/validator/[id]/rows'
import getValidator from '@/app/(details)/validator/[id]/getValidator'
import { getClient } from '@/app/config/apollo/rsc'
import ValidatorDetail from '@/app/(details)/validator/[id]/Detail'

const rpcUrl = process.env.RPC_BASE_URL!

async function ServerValidatorLayout({id}: Readonly<{
  id: string
}>) {
  const props = await getValidator(id, rpcUrl, getClient())

  return (
    <ValidatorDetail id={id} rpcUrl={rpcUrl} {...props} />
  )
}

export default async function ValidatorLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>
}>) {
  const {id} = await params

  if (!isValidPoktAddress(id)) {
    return <NotFound />
  }

  return (
    <div className={'px-3 py-5 md:px-4 gap-4 flex flex-col'}>
      <TitleEntity title={'Validator'} text={id}/>
      <Suspense
        key={id}
        fallback={
          <EntityDetail
            items={getRows(null, true)}
          />
        }
      >
        <ServerValidatorLayout id={id} />
      </Suspense>
      {children}
    </div>
  )
}
