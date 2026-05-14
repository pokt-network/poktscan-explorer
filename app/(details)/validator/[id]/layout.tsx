import React from 'react'
import {
  isValidPoktAddress,
  VALIDATOR_PREFIX
} from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import TitleEntity from '@/app/components/TitleEntity'
import Uptime from '@/app/(details)/validator/[id]/Uptime/Uptime'
import ValidatorDetail from '@/app/(details)/validator/[id]/Detail'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

const rpcUrl = getPublicRpcUrl()

export default async function ValidatorLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>
}>) {
  const {id} = await params

  if (!isValidPoktAddress(id) || !id.startsWith(VALIDATOR_PREFIX)) {
    return <NotFound />
  }

  return (
    <div className={'px-3 py-5 md:px-4 gap-4 flex flex-col'}>
      <TitleEntity title={'Validator'} text={id}/>
      <ValidatorDetail id={id} rpcUrl={rpcUrl} />

      <Uptime valoperAddress={id} />
      {children}
    </div>
  )
}
