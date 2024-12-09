import { ReactNode } from 'react'
import { getClient } from '@/app/config/apollo/rsc'
import { accountByIdDocument } from '@/app/account/[id]/operations'
import AccountDetail from '@/app/account/[id]/Detail'

export default async function AccountLayout({children, params}: {
  children: ReactNode
  params: Promise<{id: string}>
}) {
  const {id} = await params

  const {data} = await getClient().query({
    query: accountByIdDocument,
    variables: {
      id
    }
  })

  return (
    <AccountDetail initialData={data} id={id} page={children} />
  )
}
