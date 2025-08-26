'use client'

import { Check } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { TooltipArrow } from '@radix-ui/react-tooltip'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { validatorUptimeDocument } from '@/app/(details)/validator/[id]/Uptime/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import UptimeLoader from '@/app/(details)/validator/[id]/Uptime/Loader'
import UptimeCard from '@/app/(details)/validator/[id]/Uptime/Card'
import Legend from '@/app/(details)/validator/[id]/Uptime/Legend'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { formatSimpleAmount } from '@/app/utils/format'
import {
  getHexAddressFromConsensusPubkey,
  getRawValidatorFromRpc,
} from '@/app/(details)/validator/[id]/getValidator'

function Proposed() {
  return (
    <div className={'h-4 !w-4 bg-[color:--success-background] flex items-center justify-center'}>
      <Check className={'h-3.5 w-3.5 text-[color:--success] stroke-[4px]'} />
    </div>
  )
}

function Signed() {
  return (
    <div className={'h-4 !w-4 bg-[color:--success]'}/>
  )
}

function Missed() {
  return (
    <div className={'h-4 !w-4 bg-[color:--error]'}/>
  )
}

interface BlockProps {
  height: number
  proposed: boolean
  missed: boolean
}

function Block({height, proposed, missed}: BlockProps) {
  let content: React.ReactNode

  if (proposed) {
    content = (
      <Proposed />
    )
  } else if (missed) {
    content = (
      <Missed />
    )
  } else {
    content = (
      <Signed />
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        {content}
      </TooltipTrigger>
      <TooltipContent side={'top'}>
        <p className={'p-2 bg-[color:--tooltip-background] text-white rounded-lg text-xs base-shadow'}>
          {formatSimpleAmount(height)}
        </p>
        <TooltipArrow className={'mt-[-7px] fill-[color:--tooltip-background] stroke-[color:--tooltip-background] stroke-2'} />
      </TooltipContent>
    </Tooltip>
  )
}

interface ClientUptimeProps {
  valoperAddress: string
  validatorHexAddress: string
  initialData: DocumentNodeData<typeof validatorUptimeDocument> | null
  initialError: boolean
  initialFrom: string
  initialTo: string
  amountOfBlocks: number
  rpcUrl: string
}

export default function ClientUptime({
  valoperAddress,
  validatorHexAddress,
  initialFrom,
  initialTo,
  initialError,
  initialData,
  amountOfBlocks,
  rpcUrl
}: ClientUptimeProps) {
  const [hexAddress, setHexAddress] = useState(validatorHexAddress || '')
  const [{from, to}, setBlockRange] = useState({
    from: initialFrom,
    to: initialTo,
  })

  const variables = useCallback((height: number) => {
    const from = BigInt(height) - BigInt(amountOfBlocks)

    setBlockRange({
      from: from.toString(),
      to: height.toString(),
    })

    return {
      from: from.toString(),
      validatorHexAddress: hexAddress,
    }
  }, [hexAddress, amountOfBlocks])

  const {data, refetch, isLoading, error} = useFetchOnBlock({
    query:validatorUptimeDocument,
    initialResult: initialData,
    initialError,
    variables,
    skip: !hexAddress,
  })

  let content: React.ReactNode

  if (isLoading) {
    content = (
      <UptimeLoader amountOfBlocks={amountOfBlocks} />
    )
  } else if (error) {
    content = (
      <div className={'flex grow pb-10'}>
        <BaseRetryError
          onRetry={() => {
            if (!hexAddress) {
              getRawValidatorFromRpc(valoperAddress, rpcUrl).then(validator => {
                if (validator) {
                  setHexAddress(
                    getHexAddressFromConsensusPubkey(validator.consensus_pubkey.key)
                  )
                }
              })
            } else {
              refetch()
            }
          }}
        />
      </div>
    )
  } else {
    const producedBlocks = new Set(data?.producedBlocks || [])
    const missedBlocks = new Set(data?.missedBlocks || [])

    content = (
      <>
        <Legend
          proposed={producedBlocks.size}
          missed={missedBlocks.size}
          signed={amountOfBlocks + 1 - missedBlocks.size}
        />

        <div className={'px-4 pb-4 gap-1.5 grid [&_div]:!h-4 [&_div]:min-w-4 [&_div]:!rounded-none grid-cols-[repeat(auto-fit,minmax(16px,1fr))]'}>
          <TooltipProvider delayDuration={150}>
            {Array.from({length: amountOfBlocks + 1}).map((_, index) => {
              const height = Number(from) + index

              return (
                <Block
                  key={height}
                  height={height}
                  missed={missedBlocks.has(height)}
                  proposed={producedBlocks.has(height)}
                />
              )
            })}
          </TooltipProvider>
        </div>
      </>
    )
  }

  return (
    <UptimeCard
      from={from}
      to={to}
      percent={
        !isLoading && !error ?
          formatSimpleAmount(Math.abs(((data?.missedBlocks?.length || 0) - (amountOfBlocks + 1)) / (amountOfBlocks + 1)) * 100) :
          undefined
      }
    >
      {content}
    </UptimeCard>
  )
}
