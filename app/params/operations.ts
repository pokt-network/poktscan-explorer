import { graphql } from '@/app/config/gql'

export const paramsDocument = graphql(`
  query params {
    application: appParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    auth: authParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    bank: bankParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    distribution: distributionParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    gateway: gatewayParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    gov: govParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    mint: mintParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    proof: proofParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    service: serviceParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    session: sessionParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    shared: sharedParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    slashing: slashingParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    staking: stakingParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    supplier: supplierParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    tokenomics: tokenomicsParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
    consensus: consensusParams(orderBy: BLOCK_ID_DESC, distinct: KEY) {
      nodes {
        id
        key
        value
        block {
          height
        }
      }
    }
  }
`)
