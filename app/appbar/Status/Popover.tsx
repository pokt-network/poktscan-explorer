'use client'

import React, { useState } from 'react'
import useDebounce from '@/app/hooks/useDebounce'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PopoverArrow } from '@radix-ui/react-popover'
import { Check, X } from 'lucide-react'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import SyncingIcon from './syncing_icon.svg'

interface StatusPopoverProps {
  initialData: DocumentNodeData<typeof indexerMetadataDocument>
}

export default function StatusPopover({initialData}: StatusPopoverProps) {
  const data = useFetchOnBlock({
    query: indexerMetadataDocument,
    initialResult: initialData
  })

  const [open, setOpen] = useState(false);
  const debouncedOpen = useDebounce(open, 200);

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  let icon: React.ReactNode, color: string, content: React.ReactNode

  if (!data) {
    color = 'bg-[color:--error]'
    icon = <X className={'h-3 w-3 text-white'} strokeWidth={4}/>
    content = (
      <p className={'font-bold text-[color:--secondary]'}>
        Indexer Unreachable
      </p>
    )
  } else if (data && data?._metadata?.targetHeight === data?._metadata?.lastProcessedHeight) {
    color = 'bg-[color:--success]'
    icon = <Check className={'h-3 w-3 text-white'} strokeWidth={4}/>
    content = (
      <p className={'font-bold text-[color:--secondary]'}>
        Indexer Healthy!
      </p>
    )
  } else {
    const diff = (data?._metadata?.targetHeight || 0) - (data?._metadata?.lastProcessedHeight || 0)

    if (diff < 2) {
      color = 'bg-[color:white]'
      icon = (
        <div className={'w-[18px] h-[18px]'}>
          <SyncingIcon className={'text-[color:--success] scale-[69%] ml-[-11px] mt-[-11px]'}/>
        </div>
      )
      content = (
        <p className={'font-bold text-[color:--secondary]'} style={{marginTop: '1px'}}>
          Syncing...
        </p>
      )
    } else if (diff < 4) {
      color = 'bg-[color:--warning]'
      icon = <span className={'font-bold text-white text-sm'}>!</span>
    } else {
      color = 'bg-[color:--error]'
      icon = <X className={'h-3 w-3 text-white'} strokeWidth={4}/>
    }

    if (diff > 1) {
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
  }

  return (
    <Popover open={debouncedOpen} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={e => {
          e.preventDefault();
        }}
        className={'cursor-pointer'}
      >
        <div
          className={`flex items-center justify-center rounded-[50%] h-[18px] min-w-[18px] w-[18px] stroke-[3px] ${color}`}>
          {icon}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side={"bottom"}
        sideOffset={5}
        className={'p-2 bg-[color:--main-background] z-[1025] rounded-lg border border-[color:--divider] min-w-0 w-auto text-xs'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
        <PopoverArrow className={'mt-[-1px] fill-[color:--main-background] stroke-[color:--divider] stroke-2'} />
      </PopoverContent>
    </Popover>
  )
}
