import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import EntityLink from '@/app/components/EntityLink'

export const dynamic = "force-dynamic";

const paramsDocument = graphql(`
  query params {
    application: appParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    auth: authParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    bank: bankParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    distribution: distributionParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    gateway: gatewayParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    gov: govParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    mint: mintParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    proof: proofParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    service: serviceParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    session: sessionParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    shared: sharedParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    slashing: slashingParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    staking: stakingParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    supplier: supplierParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    tokenomics: tokenomicsParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    consensus: consensusParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
  }
`)

export default async function ParamsPage() {
  const { data } = await getClient().query({
    query: paramsDocument
  })

  return (
    <div className={"p-10 gap-5 flex flex-col"}>
      <div className={"flex flex-row items-center gap-3"}>
        <h1 className={'text-2xl font-semibold'}>
          Parameters
        </h1>
      </div>
      {Object.entries(data).filter(([,params]) => params.nodes.length).map(([paramName, params]) => (
        <div
          key={paramName}
          className={"bg-[color:--main-background] p-5 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow"}
        >
          <h2 className={'text-lg font-medium'}>
            {paramName.at(0).toUpperCase() + paramName.substring(1)} Parameters
          </h2>
          <div className={"grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4"}>
            {params.nodes.filter(item => item.value).map(item => {
              let value = item.value;

              try {
                const parsedValue = JSON.parse(item.value)

                if (typeof parsedValue === 'object') {
                  value = JSON.stringify(parsedValue, null, 6)
                }
              } catch {}

              return (
                <div key={item.key}
                     className={"flex flex-col justify-between gap-2 bg-[color:--background] p-4 rounded-lg border border-[color:--divider] flex flex-col gap-2"}>
                  <div className={"flex flex-col gap-2"}>
                    <p
                      className={"text-xs font-semibold text-[color:--secondary] whitespace-nowrap overflow-hidden overflow-ellipsis"}>
                      {item.key}
                    </p>
                    <p className={"text-xs text-[color:--foreground] whitespace-pre break-all"}>
                      {value}
                    </p>
                  </div>
                  <div className={"flex flex-row gap-2 items-center text-[10px]"}>
                    <EntityLink
                      entity={'block'}
                      entityId={item.block.height}
                      label={`Updated at block ${item.block.height}`}
                      copy={{ enabled: false }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
