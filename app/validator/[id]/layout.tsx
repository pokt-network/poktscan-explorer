import React, { Suspense } from 'react'
import { getClient } from '@/app/config/apollo/rsc'
import { validatorByIdDocument } from '@/app/validator/[id]/operations'
import ValidatorDetail from '@/app/validator/[id]/Detail'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/validator/[id]/rows'

async function ServerValidatorLayout({id}: Readonly<{
  id: string
}>) {
  const {data} = await getClient().query({
    query: validatorByIdDocument,
    variables: {
      id
    }
  })

  return (
    <ValidatorDetail initialData={data} id={id} />
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
