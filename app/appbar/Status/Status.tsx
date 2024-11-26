import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import { Check, X } from 'lucide-react';
import React from 'react'
import StatusPopover from '@/app/appbar/Status/Popover'

const indexerMetadataDocument = graphql(`
  query metadata {
    _metadata {
      targetHeight
      lastFinalizedVerifiedHeight
      lastProcessedHeight
      lastProcessedTimestamp
      indexerHealthy
    }
  }
`)

export default async function Status() {
  const {data} = await getClient().query({
    query: indexerMetadataDocument,
    context: {
      fetchOptions: {
        cache: 'default',
        next: {
          revalidate: 15
        },
      }
    }
  })

  let icon: React.ReactNode, color: string, content: React.ReactNode

  if (data && data?._metadata?.targetHeight === data?._metadata?.lastProcessedHeight) {
    color = 'bg-[color:--success]'
    icon = <Check className={'h-3 w-3 text-white'} strokeWidth={4}/>
    content = (
      <p className={'font-bold text-[color:--secondary]'}>
        Indexer Healthy!
      </p>
    )
  } else {
    const diff = data?._metadata?.targetHeight - data?._metadata?.lastProcessedHeight

    if (diff < 4) {
      color = 'bg-[color:--warning]'
      icon = <span className={'font-bold text-white text-sm'}>!</span>
    } else {
      color = 'bg-[color:--error]'
      icon = <X className={'h-3 w-3 text-white'} strokeWidth={4}/>
    }

    content = (
      <>
        <p className={'font-bold mb-2'}>
          Indexer Out of Sync
        </p>
        <div className={'min-w-[160px] flex flex-row items-center justify-between gap-2'}>
          <p className={'font-bold mb-1'}>
            Current Height:
          </p>
          <p>
            {data?._metadata?.lastProcessedHeight}
          </p>
        </div>
        <div className={'min-w-[160px] flex flex-row items-center justify-between gap-2'}>
          <p className={'font-bold'}>
            Target Height:
          </p>
          <p>
            {data?._metadata?.targetHeight}
          </p>
        </div>
      </>
    )
  }

  return (
    <StatusPopover
      trigger={(
        <div
          className={`flex items-center justify-center rounded-[50%] bg-[color:--success] h-[18px] min-w-[18px] w-[18px] stroke-[3px] ${color}`}>
          {icon}
        </div>
      )}
      content={content}
    />
  )
}
