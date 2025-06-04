import { graphql } from '@/app/config/gql'
import { Time } from '@/app/dashboards/node-running/constants'
import { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { addHoursToUtc } from '@/app/Charts/utils'

export const getDataByDelegatorAddressesAndTimesDocument = graphql(`
  query getDataByDelegatorAddressesAndTimes(
    $delegatorAddresses: [String!]!
    $startTime: Datetime!
    $endTime: Datetime!
  ) {
    data: getDataByDelegatorAddressesAndTimes(
      addresses: $delegatorAddresses,
      startTs: $startTime,
      endTs: $endTime
    )
  }
`)

export const getDataByDelegatorAddressesAndTimesVariables = (
  addresses: Array<string>,
  currentDate: Date | string,
  timeSelected: string
): ExtractVariables<typeof getDataByDelegatorAddressesAndTimesDocument> => {
  let timeSelectedToUse = Time.Last24h

  if (timeSelected && Object.values(Time).includes(timeSelected as Time)) {
    timeSelectedToUse = timeSelected as Time
  }

  const startCurrent = new Date(currentDate)

  let endDate: Date

  switch (timeSelectedToUse) {
    case Time.Last24h: {
      endDate = addHoursToUtc(startCurrent, -23)
      break
    }
    case Time.Last48h: {
      endDate = addHoursToUtc(startCurrent, -47)
      break
    }
  }

  return {
    delegatorAddresses: addresses,
    startTime: startCurrent.toISOString(),
    endTime: endDate.toISOString()
  }
}

export const getParamsDocument = graphql(`
  query getParams {
    params(
      filter: {
        namespace: {
          equalTo: "shared"
        },
        key: {
          in: ["claim_window_open_offset_blocks", "claim_window_close_offset_blocks", "proof_window_close_offset_blocks"]
        }
      }
      orderBy: [BLOCK_ID_DESC]
      distinct: [NAMESPACE, KEY]
    ) {
      nodes {
        key
        value
        blockId
      }
    }
  }
`)

export const getDataByDelegatorAddressesAndBlocksDocument = graphql(`
  query getDataByDelegatorAddressesAndBlocks(
    $delegatorAddresses: [String!]!
    $startBlock: BigInt!
    $endBlock: BigInt!
  ) {
    data: getDataByDelegatorAddressesAndBlocks(
      addresses: $delegatorAddresses,
      startHeight: $startBlock,
      endHeight: $endBlock
    )
  }
`)
