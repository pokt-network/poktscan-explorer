'use client'

import { SupplierResponseFromRpc } from '@/app/(details)/supplier/[id]/getSupplier'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import EntityLink from '@/app/components/EntityLink'
import React, { useEffect, useState } from 'react'
import NoData from '@/app/components/NoData'
import { Skeleton } from '@/components/ui/skeleton'
import { getUseRpcData } from '@/app/utils/metadata'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import useFetchOnBlock from '@/app/hooks/useFetchOnBlock'
import { getUrl } from '@/app/components/RawEntity/utils'
import { useLazyQuery } from '@apollo/client'
import { servicesOfSupplier } from '@/app/(details)/supplier/[id]/operations'
import { useRpcUrl } from '@/app/context/rpcUrl'

function Card({children}: React.PropsWithChildren) {
  return (
    <div
      className={"bg-[color:--main-background] px-4 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow py-2 md:min-h-[400px] md:max-h-[600px] md:overflow-y-auto"}
    >
      {children}
    </div>
  )
}

function ServiceTabLoader() {
  const row = (
    <div className={'h-[56px] flex flex-row items-center gap-2 border-b border-[color:--divider]'}>
      <Skeleton className={'h-5 w-16'} />
      <Skeleton className={'h-7 w-16'} />
      <Skeleton className={'h-7 w-20'} />
      <Skeleton className={'h-7 w-24'} />
    </div>
  )

  return (
    <Card>
      <div>
        {row}
        {row}
        {row}
        {row}
      </div>
    </Card>
  )
}

function getEndpointLabel(type: string) {
  switch (type) {
    case 'GRPC':
      return 'gRPC'
    case 'WEBSOCKET':
      return 'WebSocket'
    case 'JSON_RPC':
      return 'JSON-RPC'
    case 'REST':
      return 'REST'
    default:
      return 'Unknown'
  }
}

interface ServicesTabProps {
  id: string
}

export default function ServicesTab({id}: ServicesTabProps) {
  const rpcUrl = useRpcUrl()
  const [rpcData, setRpcData] = useState<SupplierResponseFromRpc['supplier'] | null | undefined>(undefined)
  const [isLoadingRpc, setIsLoadingRpc] = useState(false)
  const [graphqlServices, setGraphqlServices] = useState<Array<SupplierResponseFromRpc['supplier']['services'][number] & {activatedAt: string}>>([])

  const { data: metadata, isLoading: isLoadingMetadata } = useFetchOnBlock({
    query: indexerMetadataDocument,
    initialResult: null,
    initialError: false
  })

  const useRpcData = metadata ? getUseRpcData(metadata) : false

  const [fetchGraphqlServices, { loading: isLoadingGraphql }] = useLazyQuery(servicesOfSupplier, {
    fetchPolicy: 'network-only',
    onCompleted: async (data) => {
      const services: Array<SupplierResponseFromRpc['supplier']['services'][number] & {activatedAt: string}> = []

      services.push(
        ...data.supplierServiceConfigs.nodes.map((service: any) => ({
          service_id: service.serviceId,
          endpoints: service.endpoints.map((endpoint: any) => ({
            url: endpoint.url,
            rpc_type: endpoint.rpcType,
            configs: endpoint.configs.map((config: any) => ({
              key: config.key,
              value: config.value,
            }))
          })),
          rev_share: service.revShare.map((revShare: any) => ({
            address: revShare.address,
            rev_share_percentage: revShare.revSharePercentage,
          })),
          activatedAt: service.activatedAtId,
        }))
      )

      // If there are more pages, fetch them recursively
      if (data.supplierServiceConfigs.pageInfo.hasNextPage) {
        fetchGraphqlServices({
          variables: {
            address: id,
            cursor: data.supplierServiceConfigs.pageInfo.endCursor
          }
        })
      }

      setGraphqlServices(prev => [...prev, ...services])
    }
  })

  useEffect(() => {
    if (useRpcData && rpcData === undefined && !isLoadingRpc) {
      setIsLoadingRpc(true)
      fetch(getUrl(rpcUrl, 'supplier', id))
        .then(res => {
          if (res.status === 404) {
            return null
          }
          return res.json().then(data => data.supplier)
        })
        .then(data => {
          setRpcData(data)
          setIsLoadingRpc(false)
        })
        .catch(() => {
          setRpcData(null)
          setIsLoadingRpc(false)
        })
    }
  }, [useRpcData, id, rpcData, isLoadingRpc])

  useEffect(() => {
    if (!useRpcData && !isLoadingMetadata && graphqlServices.length === 0 && !isLoadingGraphql) {
      setGraphqlServices([])
      fetchGraphqlServices({
        variables: {
          address: id,
          cursor: null
        }
      })
    }
  }, [useRpcData, isLoadingMetadata, id, graphqlServices.length, isLoadingGraphql, fetchGraphqlServices])

  if (isLoadingMetadata || (useRpcData && isLoadingRpc) || (!useRpcData && isLoadingGraphql && graphqlServices.length === 0)) {
    return <ServiceTabLoader />
  }

  const supplier = rpcData
  const services: Array<SupplierResponseFromRpc['supplier']['services'][number] & {activatedAt?: string}> =
    useRpcData ? (supplier?.services || []) : graphqlServices

  let content: React.ReactNode

  if (services.length === 0) {
    content = (
      <div className={'flex grow justify-center items-center'}>
        <NoData label={'No services found'} />
      </div>
    )
  } else {
    const activationHeightPerService = supplier?.service_config_history?.reduce((acc, {service, activation_height, deactivation_height}) => {
      if (deactivation_height !== '0') return acc

      const currentItem = acc[service.service_id]

      const activationHeight = BigInt(activation_height)
      if (!currentItem || currentItem < activationHeight) {
        acc[service.service_id] = activationHeight
      }

      return acc
    },{} as Record<string, bigint>) || {}

    content = (
      <Accordion type={'multiple'} className={'p-0'}>
        {services.map((service, index) => {
          const revSharing = service.rev_share.reduce((acc, item) => acc + Number(item.rev_share_percentage), 0)

          return (
            <AccordionItem
              value={index.toString()}
              key={index.toString()}
              className={index === services.length - 1 ? 'border-none' : undefined}
            >
              <AccordionTrigger className={'flex flex-row gap-2 justify-start items-center flex-wrap h-14'}>
                <p className={'font-medium text-md whitespace-nowrap text-ellipsis overflow-hidden'}>
                  {service.service_id}
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
                {(service.activatedAt || activationHeightPerService[service.service_id]) && (
                  <div className={'h-7 flex flex-row gap-2 items-center border-[2px] border-[color:--divider] pl-2 py-1 bg-[color:--background] ml-1 mr-[2px] rounded-md'}>
                    <p
                      className={'text-xs whitespace-nowrap'}>
                      Activated at
                    </p>
                    <div className={'text-xs [&_button]:scale-75 [&_button]:-ml-2'}>
                      <EntityLink entity={'block'} entityId={service.activatedAt || activationHeightPerService[service.service_id].toString()} />
                    </div>
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
                        {getEndpointLabel(endpoint.rpc_type)}
                      </p>
                    </li>
                  ))}
                </ul>
                <h3 className={"text-sm font-medium mt-4 mb-2"}>
                  Rev Share
                </h3>
                {service.rev_share.length > 0 ? (
                  <ul className={'pl-2'}>
                    {service.rev_share.map((revShare, index) => (
                      <li key={index} className={'flex flex-row gap-2 items-center'}>
                        -
                        <div className={'text-xs text-[color:--secondary]'}>
                          <EntityLink
                            entity={'account'}
                            entityId={revShare.address}
                          />
                        </div>
                        <p className={'text-xs font-bold'}>
                          {revShare.rev_share_percentage}%
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
    )
  }

  return (
    <Card>
      {content}
    </Card>
  )
}
