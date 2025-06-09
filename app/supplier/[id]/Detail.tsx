'use client'

import { supplierByIdDocument } from '@/app/supplier/[id]/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useMemo } from 'react'
import NotFound from '@/app/not-found'
import { getEndpointLabel, getStakeLabel, getStakeType } from '@/app/utils/stake'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { formatAmount } from '@/app/utils/format'
import TitleEntity from '@/app/components/TitleEntity'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import EntityLink from '@/app/components/EntityLink'
import { StakeStatus } from '@/app/config/gql/graphql'

interface SupplierDetailProps {
  initialData: DocumentNodeData<typeof supplierByIdDocument>
  id: string
  page: React.ReactNode
}

export default function SupplierDetail({id, page, initialData}: SupplierDetailProps) {
  const variables = useMemo(() => ({id}), [id])

  const data = useFetchOnBlock({
    query: supplierByIdDocument,
    variables,
    initialResult: initialData
  })

  if (!data.supplier) {
    return (
      <NotFound />
    )
  }

  const {supplier} = data

  const stakeType = getStakeType(supplier.stakeStatus, supplier.id, supplier.owner?.id)
  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Status',
      value: getStakeLabel(supplier.stakeStatus)
    },
    {
      type: 'row',
      label: 'Stake Type',
      value: stakeType
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: formatAmount({
        amount: supplier.stakeAmount,
        denom: supplier.stakeDenom
      })
    },
  ]

  if (stakeType === 'Non-Custodian') {
    rows.push({
      type: 'divider'
    }, {
      type: 'row',
      label: 'Operator Address',
      value: supplier.id,
    })
  }

  rows.push({
    type: 'row',
    label: 'Balance',
    value: formatAmount(supplier.operator?.balances?.nodes?.at(0) || {
      amount: '0',
      denom: 'upokt'
    })
  })

  if (stakeType === 'Non-Custodian') {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Owner Address',
        value: supplier.owner!.id,
      },
      {
        type: 'row',
        label: 'Owner Balance',
        value: formatAmount(supplier.owner?.balances?.nodes?.at(0) || {
          amount: '0',
          denom: 'upokt'
        })
      })
  }

  if (supplier.stakeStatus !== StakeStatus.Staked) {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Unstaking Begin At',
        value: supplier.unstakingBeginBlock!.height
      },
      {
        type: 'row',
        label: 'Unstaking End At',
        value: supplier.unstakingEndHeight
      })

    if (supplier.unstakingEndBlock) {
      rows.push({
        type: 'row',
        label: 'Unstaked At Height',
        value: supplier.unstakingEndBlock!.height
      })
    }
  }

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Supplier'} text={supplier.id} />
      <EntityDetail
        items={rows}
      />

      <div
        className={"bg-[color:--main-background] px-4 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow py-2"}
      >
        <Accordion type={'single'} className={'p-0'} collapsible={true}>
          <AccordionItem value={'services'}>
            <AccordionTrigger className={'h-10 border-none'}>
              <h2 className={"text-lg font-semibold"}>
                Services
              </h2>
            </AccordionTrigger>
            <AccordionContent className={"py-0 px-2"}>
              <Accordion type={'multiple'} className={'p-0'}>
                {supplier.supplierServices.nodes.map((service, index) => {
                  const revSharing = service.revShare.reduce((acc, item) => acc + Number(item.revSharePercentage), 0)

                  return (
                    <AccordionItem
                      value={index.toString()}
                      key={index.toString()}
                      className={index === supplier.supplierServices.nodes.length - 1 ? 'border-none' : undefined}
                    >
                      <AccordionTrigger className={'flex flex-row gap-2 justify-start items-center flex-wrap h-14'}>
                        <p className={'font-medium text-md whitespace-nowrap text-ellipsis overflow-hidden'}>
                          {service.service.name}{service.service.id !== service.service.name ? ` (${service.service.id})` : ''}
                        </p>
                        <p
                          className={'text-xs bg-[color:--background] ml-1 mr-[2px] p-2 py-1 rounded-md border-[2px] border-[color:--divider] whitespace-nowrap'}>
                          {service.endpoints.length} endpoint{service.endpoints.length > 1 ? 's' : ''}
                        </p>
                        {revSharing > 0 && (
                          <p
                            className={'text-xs bg-[color:--background] ml-1 mr-[2px] p-2 py-1 rounded-md border-[2px] border-[color:--divider] whitespace-nowrap'}>
                            Rev Sharing: {revSharing}%
                          </p>
                        )}
                        {service?.activatedAt && (
                          <div className={'h-7 flex flex-row gap-2 items-center border-[2px] border-[color:--divider] pl-2 py-1 bg-[color:--background] ml-1 mr-[2px] rounded-md'}>
                            <p
                              className={'text-xs whitespace-nowrap'}>
                              Activated at
                            </p>
                            <p className={'text-xs [&_button]:scale-75 [&_button]:-ml-2'}>
                              <EntityLink entity={'block'} entityId={service.activatedAt.id} />
                            </p>
                          </div>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className={"p-4 bg-[color:--background]"}>
                        <h3 className={"text-sm font-medium mb-2"}>
                          Endpoints
                        </h3>
                        <ul className={'pl-2'}>
                          {service.endpoints.map((endpoint, index) => (
                            <li key={index} className={'flex flex-row gap-2 items-center'}>
                              -
                              <p className={'text-xs'}>
                                {endpoint.url}
                              </p>
                              <p
                                className={'text-[10px] bg-[color:--background] ml-[2px] p-2 py-[0px] font-bold rounded-sm border border-[color:--divider]'}>
                                {getEndpointLabel(endpoint.rpcType)}
                              </p>
                            </li>
                          ))}
                        </ul>
                        <h3 className={"text-sm font-medium mt-4 mb-2"}>
                          Rev Share
                        </h3>
                        {service.revShare.length > 0 ? (
                          <ul className={'pl-2'}>
                            {service.revShare.map((revShare, index) => (
                              <li key={index} className={'flex flex-row gap-2 items-center'}>
                                -
                                <div className={'text-xs text-[color:--secondary]'}>
                                  <EntityLink
                                    entity={'account'}
                                    entityId={revShare.address}
                                  />
                                </div>
                                <p className={'text-xs font-bold'}>
                                  {revShare.revSharePercentage}%
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={'text-xs text-[color:--secondary] ml-2'}>
                            None
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </div>
      {page}
    </div>
  );
}
