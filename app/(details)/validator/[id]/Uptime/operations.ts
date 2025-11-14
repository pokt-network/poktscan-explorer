import { gql } from '@apollo/client'

export const validatorUptimeDocument = gql`
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
`
