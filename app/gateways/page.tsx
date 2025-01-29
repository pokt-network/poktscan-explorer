import React from 'react'
import ListTitle from '@/app/components/ListTitle'
import GatewaysTable from '@/app/components/GatewaysTable/GatewaysTable'
import { getPageAndItems } from '@/app/utils/pagination'

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function GatewaysPage({searchParams}: PageProps) {
  const {page, itemsPerPage,} = await getPageAndItems(searchParams)
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Gateways'} />
      <GatewaysTable page={page} itemsPerPage={itemsPerPage} basePath={'/apps'}/>
    </div>
  )
}
