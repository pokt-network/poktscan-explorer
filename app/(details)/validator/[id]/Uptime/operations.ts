import { graphql } from '@/app/config/gql'

export const validatorUptimeDocument = graphql(`
  query validatorUptime($from: BigInt!, $validatorHexAddress: String!) {
    producedBlocks: getProducedBlocksByValidator(
      fromId: $from
      validatorAddress: $validatorHexAddress
    )
    missedBlocks: getMissingValidatorBlocks(
      fromId: $from
      validatorAddress: $validatorHexAddress
    )
  }
`)
