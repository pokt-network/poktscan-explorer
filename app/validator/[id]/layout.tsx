import React from 'react'
import { getClient } from '@/app/config/apollo/rsc'
import { validatorByIdDocument } from '@/app/validator/[id]/operations'
import ValidatorDetail from '@/app/validator/[id]/Detail'

export default async function ValidatorLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>
}>) {
  const {id} = await params

  const {data} = await getClient().query({
    query: validatorByIdDocument,
    variables: {
      id
    }
  })

  return (
    <ValidatorDetail initialData={data} id={id} page={children} />
  )
}
