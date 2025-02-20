import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import StatusPopover from '@/app/appbar/Status/Popover'
import { indexerMetadataDocument } from '@/app/api/metadata'

export default async function Status() {
  const {data} = await getClient().query({
    query: indexerMetadataDocument,
  })

  return (
    <StatusPopover
      initialData={data}
    />
  )
}
