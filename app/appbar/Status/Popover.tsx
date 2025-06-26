'use client'

import React, { useState } from 'react'
import useDebounce from '@/app/hooks/useDebounce'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PopoverArrow } from '@radix-ui/react-popover'
import { Check, X } from 'lucide-react'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import SyncingIcon from './syncing_icon.svg'
import { clsx } from 'clsx'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function StatusLoader() {
  return (
    <div
      className={
        clsx(
          'flex items-center justify-center px-2 py-1 rounded-sm border-2 gap-1 border-[color:--divider]',
        )
      }
    >
      <Skeleton className={'h-4 w-16'} />
      <Skeleton className={'h-[15px] w-[15px] rounded-[50%]'} />
    </div>
  )
}

interface StatusPopoverProps {
  initialData: DocumentNodeData<typeof indexerMetadataDocument>
  initialError: boolean
  pollInterval?: number
}

export default function StatusPopover({initialData, initialError, pollInterval}: StatusPopoverProps) {
  const { data, error, refetch, isLoading } = useFetchOnBlock({
    query: indexerMetadataDocument,
    initialResult: initialData,
    pollInterval,
    initialError
  })

  const [open, setOpen] = useState(false);
  const debouncedOpen = useDebounce(open, 200);

  if (isLoading) {
    return (
      <StatusLoader />
    )
  } else if (error) {
    return (
      <Button
        className={
          clsx(
            'h-7 px-2 py-1 rounded-sm border-2 gap-1 bg-[color:#ffaaaa24] border-[color:--error-background] text-[color:--error] text-xs',
          )
        }
        onClick={refetch}
      >
        Status Error. Retry
      </Button>
    )
  }

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  let icon: React.ReactNode, color: string, text: string

  const diff = (data?._metadata?.targetHeight || 0) - (data?._metadata?.lastProcessedHeight || 0)

  if (!data) {
    color = 'bg-[color:--error]'
    icon = <X className={'h-3 w-3 text-white'} strokeWidth={4}/>
    text = 'Indexer Unreachable'
  } else if (diff <= 5) {
    color = 'bg-[color:--success]'
    icon = <Check className={'h-3 w-3 text-white'} strokeWidth={4}/>
    text = diff <= 2 ? 'Synced!' : 'Healthy!'
  } else {
    if (diff <= 20) {
      color = 'bg-[color:white]'
      text = 'Syncing'
      icon = (
        <div className={'w-[18px] h-[18px]'}>
          <SyncingIcon className={'text-[color:--success] scale-[69%] ml-[-11px] mt-[-11px]'}/>
        </div>
      )
    } else if (diff <= 100) {
      color = 'bg-[color:--warning]'
      icon = <span className={'font-bold text-white text-sm'}>!</span>
      text = 'Out of Sync'
    } else {
      color = 'bg-[color:--error]'
      text = 'Out of Sync'
      icon = <X className={'h-3 w-3 text-white'} strokeWidth={4}/>
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
          className={
            clsx(
              'flex items-center justify-center px-2 py-1 rounded-sm border dark:border-2 gap-1',
              data &&  diff <= 20 && 'border-[color:--success] dark:border-[color:--success-background]',
              data && diff > 20 && diff <= 100 && 'border-[color:--warning] dark:border-[color:--warning-background]',
              (diff > 100 || !data) && 'border-[color:--error] dark:border-[color:--error-background]',
            )
          }
        >
          <p
            className={
              clsx(
                'text-xs font-semibold whitespace-nowrap',
                data && diff <= 20 && 'text-[color:--success]',
                data && diff > 20 && diff <= 100 && 'text-[color:--warning]',
                (diff > 100 || !data) && 'text-[color:--error]',
              )
            }
          >
            {text}
          </p>
          <div
            className={`flex items-center justify-center rounded-[50%] h-[12px] min-w-[12px] w-[12px] stroke-[3px] ${color}`}>
            {icon}
          </div>
        </div>

      </PopoverTrigger>
      <PopoverContent
        side={"bottom"}
        sideOffset={5}
        className={'p-2 bg-[color:--main-background] z-[1025] rounded-sm border border-[color:--divider] min-w-0 w-auto text-xs'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {data ? (
          <>
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
        ) : (
            <p>
              An error occurred while fetching indexer status.
            </p>
          )}
        <PopoverArrow className={'mt-[-1px] fill-[color:--main-background] stroke-[color:--divider] stroke-2'} />
      </PopoverContent>
    </Popover>
  )
}
