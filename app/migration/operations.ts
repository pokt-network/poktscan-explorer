import { graphql } from '@/app/config/gql'

export const morseClaimableAccountsPageDocument = graphql(`
  query morseClaimableAccountsList($limit: Int!, $offset: Int!, $filter: MorseClaimableAccountFilter) {
    morseClaimableAccounts(
      first: $limit,
      offset: $offset,
      filter: $filter,
      orderBy: [CLAIMED_DESC, CLAIMED_AT_HEIGHT_DESC],
    ) {
      totalCount
      nodes {
        # morseSrcAddress
        id

        shannonDestAddress
        claimed
        claimedAtHeight

        unstakedBalanceAmount
        unstakedBalanceDenom

        supplierStakeAmount
        supplierStakeDenom

        applicationStakeAmount
        applicationStakeDenom
      }
    } 
  }
`)

export const morseClaimableAccountsSummaryDocument = graphql(`
  query morseClaimableAccountsSummary {
    morseClaimableAccounts {
      groupedAggregates(groupBy: CLAIMED) {
        keys
        sum {
          applicationStakeAmount
          supplierStakeAmount
          unstakedBalanceAmount
        }
      }
    }
  }
`)
