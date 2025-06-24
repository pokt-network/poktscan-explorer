import { getClient } from '@/app/config/apollo/rsc'
import React, { Suspense } from 'react'
import StatusPopover, { StatusLoader } from '@/app/appbar/Status/Popover'
import { indexerMetadataDocument } from '@/app/operations/metadata'

async function ServerStatus() {
  let data = null, error = false

  try {
    const res = await getClient().query({
      query: indexerMetadataDocument,
    })
    data = res.data
  } catch {
    error = true
  }

  return (
    <StatusPopover
      initialData={data}
      initialError={error}
      pollInterval={process.env.METADATA_POLL_INTERVAL ? parseInt(process.env.METADATA_POLL_INTERVAL) : 5000}
    />
  )
}

export default async function Status() {
  return (
    <Suspense
      fallback={(
        <StatusLoader />
      )}
    >
      <ServerStatus />
    </Suspense>
  )
}
