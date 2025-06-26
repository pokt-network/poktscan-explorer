import { graphql } from '@/app/config/gql'
import { TimeClaimProofTable } from '@/app/tools/operator/constants'
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
  let timeSelectedToUse = TimeClaimProofTable.Last24h

  if (timeSelected && timeSelected !== TimeClaimProofTable.LastClaimingWindow && Object.values(TimeClaimProofTable).includes(timeSelected as TimeClaimProofTable)) {
    timeSelectedToUse = timeSelected as TimeClaimProofTable
  }

  const endDate = new Date(currentDate)

  let startDate: Date

  switch (timeSelectedToUse) {
    case TimeClaimProofTable.Last24h: {
      startDate = addHoursToUtc(endDate, -24)
      break
    }
    case TimeClaimProofTable.Last48h: {
      startDate = addHoursToUtc(endDate, -48)
      break
    }
    default: {
      throw new Error('Invalid time selected')
    }
  }

  return {
    delegatorAddresses: addresses,
    startTime: startDate.toISOString(),
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
