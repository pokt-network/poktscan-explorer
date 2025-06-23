import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import StatusPopover from '@/app/appbar/Status/Popover'
import { indexerMetadataDocument } from '@/app/operations/metadata'

export default async function Status() {
  let data = null

  try {
    const res = await getClient().query({
      query: indexerMetadataDocument,
    })
    data = res.data
  } catch {}

  return (
    <StatusPopover
      initialData={data}
      pollInterval={process.env.METADATA_POLL_INTERVAL ? parseInt(process.env.METADATA_POLL_INTERVAL) : 5000}
    />
  )
}
