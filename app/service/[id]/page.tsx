import React from 'react'
import ServiceTabs from '@/app/service/[id]/Tabs'

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ServicePage({params, searchParams}: PageProps) {
  return (
    <ServiceTabs params={params} searchParams={searchParams}/>
  )
}
