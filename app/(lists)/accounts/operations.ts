import { graphql } from '@/app/config/gql'

export const accountListDocument = graphql(`
  query accountList($limit: Int!, $offset: Int!) {
    balances (
      first: $limit,
      offset: $offset,
      orderBy: AMOUNT_DESC
      filter: {denom: {equalTo: "upokt"}}
    ) {
      totalCount
      nodes {
        amount
        denom
        accountId
        lastUpdatedBlock {
          height: id
          timestamp
        }
      }
    }
  }
`)

export const accountSummaryDocument = graphql(`
  query accountSummary($todayDate: Datetime!, $monthDate: Datetime!, $last90Date: Datetime!) {
    accountsWithBalance: balances(filter: {amount: {greaterThan: "0"}}) {
      totalCount
    }
    todayAccounts: balances(filter: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $todayDate}}, denom: {equalTo: "upokt"}}) {
      totalCount
    }
    monthAccounts: balances(filter: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $monthDate}}, denom: {equalTo: "upokt"}}) {
      totalCount
    }
    last90DaysAccounts: balances(filter: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $last90Date}}, denom: {equalTo: "upokt"}}) {
      totalCount
    }
  }
`)
