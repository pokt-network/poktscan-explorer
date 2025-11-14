import { gql } from '@apollo/client'

export const indexerMetadataDocument = gql`
  query metadata {
    _metadata {
      targetHeight
      lastFinalizedVerifiedHeight
      lastProcessedHeight
      lastProcessedTimestamp
      indexerHealthy
    }
  }
`
