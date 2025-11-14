import { gql } from '@apollo/client'

export const morseClaimableAccountsPageDocument = gql`
  query morseClaimableAccountsList($limit: Int!, $offset: Int!, $filter: MorseClaimableAccountFilter) {
    morseClaimableAccounts(
      first: $limit,
      offset: $offset,
      filter: $filter,
      orderBy: [CLAIMED_DESC, CLAIMED_AT_ID_DESC],
    ) {
      totalCount
      nodes {
        # morseSrcAddress
        id

        shannonDestAddress
        claimed
        claimedAtHeight: claimedAtId
        transactionId

        unstakedBalanceAmount
        unstakedBalanceDenom

        supplierStakeAmount
        supplierStakeDenom

        applicationStakeAmount
        applicationStakeDenom
      }
    }
  }
`

export const morseClaimableAccountsSummaryDocument = gql`
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
`
