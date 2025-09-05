import { graphql } from '@/app/config/gql'
import { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime } from '@/app/utils/dates'

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
  dateStr: string,
  timeSelected: string
): ExtractVariables<typeof getDataByDelegatorAddressesAndTimesDocument> => {
  const { start, end } = getStartAndEndDateBasedOnTime(
    dateStr,
    timeSelected
  )

  return {
    delegatorAddresses: addresses,
    startTime: start.toISOString(),
    endTime: end.toISOString()
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

export const slashedDocument = graphql(`
  query slashedItems($limit: Int!, $offset: Int!, $filter: EventSupplierSlashedFilter!) {
    eventSupplierSlasheds(
      orderBy: [BLOCK_ID_DESC, SUPPLIER_ID_DESC]
      filter: $filter
      first: $limit,
      offset: $offset,
    ) {
      totalCount
      nodes {
        supplierId
        blockId
        proofValidationStatus
        proofMissingPenalty
        previousStakeAmount
        afterStakeAmount
        sessionId
        serviceId
        applicationId
      }
    }
  }
`)

export const rewardsByServicesDocument = graphql(`
  query rewardsByServices(
    $delegatorAddresses: [String!]!
    $startTime: Datetime!
    $endTime: Datetime!
  ) {
    data: getRewardsByAddressesAndTimeGroupByService(
      addresses: $delegatorAddresses,
      startTs: $startTime,
      endTs: $endTime
    )
  }
`)

export const claimProofByAddressesAndTimesDocument = graphql(`
  query claimProofData(
    $addresses: [String!]!
    $startDate: Datetime!
    $endDate: Datetime!
    $truncInterval: String!
  ) {
    data: getClaimProofsDataByDelegatorsAndTime(
      addresses: $addresses,
      startTs: $startDate,
      endTs: $endDate,
      truncInterval: $truncInterval
    )
  }
`)

export const claimProofByAddressesAndTimesVariables = (
  addresses: Array<string>,
  dateStr: string,
  timeSelected: string
): ExtractVariables<typeof claimProofByAddressesAndTimesDocument> => {
  const { start, end, truncInterval } = getStartAndEndDateBasedOnTime(
    dateStr,
    timeSelected
  )

  return {
    addresses,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    truncInterval,
  }
}
