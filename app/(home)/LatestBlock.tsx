'use client'

import EntityLink from '@/app/components/EntityLink'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import { formatTimeDifference } from '@/app/(home)/utils'
import { formatAmount } from '@/app/utils/format'
import { latestBlockQuery } from '@/app/operations/block'
import useFetchOnBlock, { DeepRequired, DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

interface LatestBlockProps {
  initialData: Required<DeepRequired<DocumentNodeData<typeof latestBlockQuery>>['blocks']['nodes'][0]>
}

export default function LatestBlock({
  initialData
}: LatestBlockProps) {
  const latestBlock = useFetchOnBlock({
    query: latestBlockQuery,
    resultParser: (result) => result.blocks.nodes.at(0),
    initialResult: initialData,
    variables: undefined
  })

  const latestBlockItems = [
    {
      label: 'Height',
      value: (
        <div className={'text-sm mr-[-10px]'}>
          <EntityLink
            entity={'block'}
            entityId={latestBlock.height}
          />
        </div>
      )
    },
    {
      label: (
        <DateColumn />
      ),
      value: <DateCellText value={latestBlock.timestamp} />
    },
    {
      label: 'Took',
      value: formatTimeDifference(latestBlock.timeToBlock!)
    },
    {
      label: 'Staked Apps',
      value: formatAmount({
        amount: latestBlock.stakedApps,
      })
    },
    {
      label: 'Staked Gateways',
      value: formatAmount({
        amount: latestBlock.stakedGateways,
      })
    },
    {
      label: 'Staked Suppliers',
      value: formatAmount({
        amount: latestBlock.stakedSuppliers,
      })
    },
  ]

  return (
    <div className={'bg-[color:--main-background]  pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
      <div className={'h-[50px] p-4 flex items-center border-b border-[color:--divider]'}>
        <p className={'font-semibold text-[15px]'}>
          Latest Block
        </p>
      </div>
      <div className={'px-4'}>
        {
          latestBlockItems.map((item, index,) => (
            <div key={index}
                 className={`flex items-center justify-between h-[40px] ${index !== latestBlockItems.length - 1 ? 'border-b' : ''} border-[color:--divider] px-2`}>
              <p className={'text-sm text-neutral-700 dark:text-[color:--foreground]'}>
                {item.label}
              </p>
              {typeof item.value === 'string' ? (
                <p className={'text-sm'}>
                  {item.value}
                </p>
              ) : item.value}
            </div>
          ))
        }
      </div>
    </div>
  )
}
