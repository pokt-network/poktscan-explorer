import { getClient } from '@/app/config/apollo/rsc'
import { graphql } from '@/app/config/gql'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { getEndpointLabel, getStakeLabel, getStakeType } from '@/app/utils/stake'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import EntityLink from '@/app/components/EntityLink'
import { formatAmount } from '@/app/utils/format'
import TitleEntity from '@/app/components/TitleEntity'
import React from 'react'

const supplierByIdDocument = graphql(`
  query supplierById($id: String!) {
    supplier(id: $id) {
      id
      owner {
        id
        balances {
          nodes {
            amount
            denom
          }
        }
      }
      operator {
        id
        balances {
          nodes {
            amount
            denom
          }
        }
      }
      stakeAmount
      stakeDenom
      stakeStatus
      unstakingEndBlock {
        height
      }
     unstakingBeginBlock {
        height
      }
      unstakingEndHeight
      supplierServices: serviceConfigs {
        nodes {
          revShare
          endpoints
          service {
            id
            name
          }
        }
      }
    }
  }
`)

export default async function RootLayout({children, params}: Readonly<{
  children: React.ReactNode;
}>) {
  const {id} = await params

  const {data} = await getClient().query({
    query: supplierByIdDocument,
    variables: {
      id
    }
  })

  if (!data.supplier) {
    return (
      <div>not found</div>
    )
  }

  const {supplier} = data

  const stakeType = getStakeType(supplier.stakeStatus, supplier.id, supplier.owner.id)
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
    value: formatAmount(supplier.operator.balances.nodes.at(0)!)
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
        value: formatAmount(supplier.owner.balances.nodes.at(0)!)
      })
  }

  if (supplier.stakeStatus !== 0) {
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
      <h2 className={"text-xl font-semibold"}>
        Services
      </h2>
      <div
        className={"bg-[color:--main-background] px-4 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow"}>
        <Accordion type={'multiple'} className={'p-0'}>
          {supplier.supplierServices.nodes.map((service, index) => {
            const revSharing = service.revShare.reduce((acc, item) => acc + Number(item.revSharePercentage), 0)

            return (
              <AccordionItem value={index.toString()} key={index.toString()}
                             className={index === supplier.supplierServices.nodes.length - 1 ? 'border-none' : undefined}>
                <AccordionTrigger className={'flex flex-row gap-2 justify-start items-center'}>
                  <p className={'font-medium text-md'}>
                    {service.service.name}{service.service.id !== service.service.name ? ` (${service.service.id})` : ''}
                  </p>
                  <p
                    className={'text-xs bg-[color:--background] ml-1 mr-[2px] p-2 py-1 rounded-md border-[2px] border border-[color:--divider]'}>
                    {service.endpoints.length} endpoint{service.endpoints.length > 1 ? 's' : ''}
                  </p>
                  {revSharing > 0 && (
                    <p
                      className={'text-xs bg-[color:--background] ml-1 mr-[2px] p-2 py-1 rounded-md border-[2px] border border-[color:--divider]'}>
                      Rev Sharing: {revSharing}%
                    </p>
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
      </div>
      {children}
    </div>
  );
}
