import { graphql } from '@/app/config/gql'

export const indexerMetadataDocument = graphql(`
  query metadata {
    _metadata {
      targetHeight
      lastFinalizedVerifiedHeight
      lastProcessedHeight
      lastProcessedTimestamp
      indexerHealthy
    }
  }
`)
