import { getRawSupplierFromRpc } from '@/app/(details)/supplier/[id]/getSupplier'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import EntityLink from '@/app/components/EntityLink'
import { SupplierRpcType } from '@/app/(details)/supplier/[id]/Detail'
import React, { Suspense } from 'react'
import NoData from '@/app/components/NoData'
import { Skeleton } from '@/components/ui/skeleton'

const rpcUrl = process.env.RPC_BASE_URL!

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

async function ServerServicesTab({id}: ServicesTabProps) {
  const supplier: SupplierRpcType = await getRawSupplierFromRpc(id, rpcUrl)

  let content: React.ReactNode

  if (supplier.services.length === 0) {
    content = (
      <div className={'flex grow justify-center items-center'}>
        <NoData label={'No services found'} />
      </div>
    )
  } else {
    const activationHeightPerService = supplier.service_config_history.reduce((acc, {service, activation_height, deactivation_height}) => {
      if (deactivation_height !== '0') return acc

      const currentItem = acc[service.service_id]

      const activationHeight = BigInt(activation_height)
      if (!currentItem || currentItem < activationHeight) {
        acc[service.service_id] = activationHeight
      }

      return acc
    },{} as Record<string, bigint>)

    content = (
      <Accordion type={'multiple'} className={'p-0'}>
        {supplier.services.map((service, index) => {
          const revSharing = service.rev_share.reduce((acc, item) => acc + Number(item.rev_share_percentage), 0)

          return (
            <AccordionItem
              value={index.toString()}
              key={index.toString()}
              className={index === supplier.services.length - 1 ? 'border-none' : undefined}
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
                {activationHeightPerService[service.service_id] && (
                  <div className={'h-7 flex flex-row gap-2 items-center border-[2px] border-[color:--divider] pl-2 py-1 bg-[color:--background] ml-1 mr-[2px] rounded-md'}>
                    <p
                      className={'text-xs whitespace-nowrap'}>
                      Activated at
                    </p>
                    <div className={'text-xs [&_button]:scale-75 [&_button]:-ml-2'}>
                      <EntityLink entity={'block'} entityId={activationHeightPerService[service.service_id].toString()} />
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

export default async function ServicesTab({id}: ServicesTabProps) {
  return (
    <Suspense
      key={id}
      fallback={
        <ServiceTabLoader />
      }
    >
      <ServerServicesTab id={id}/>
    </Suspense>
  )
}
