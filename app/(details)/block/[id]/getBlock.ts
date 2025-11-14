import type { ApolloClient } from '@apollo/client'
import { getUrl } from '@/app/components/RawEntity/utils'
import { fromBase64, toHex } from '@cosmjs/encoding'
import { gql } from '@apollo/client'
import { Block } from '@/app/config/gql/graphql'
import { fetchDataFromRpcOrIndexer } from '@/app/utils/fetch'
import { cache } from 'react'

export const blockByHeightDocument = gql`
  query blockByHeight($height: BigFloat!) {
    block(id: $height) {
      hash
      height: id
      timestamp
      totalTxs
      timeToBlock
      successfulTxs
      stakedApps
      stakedSuppliers
      stakedGateways
      totalRelays
      totalComputedUnits
      proposerAddress
      stakedAppsTokens
      stakedSuppliersTokens
      stakedGatewaysTokens
      size
      supplies {
        nodes {
          supply {
            denom
            amount
          }
        }
      }
      metadata {
        header
        lastCommit
        blockId
      }
    }
  }
`

const blockByHashDocument = gql`
  query blockByHash($hash: String!) {
    blocks(
      filter: {
        hash: { equalTo: $hash }
      }
      first: 1
    ) {
      nodes {
        height: id
        hash
        timestamp
        totalTxs
        timeToBlock
        successfulTxs
        stakedApps
        stakedSuppliers
        stakedGateways
        totalRelays
        totalComputedUnits
        proposerAddress
        stakedAppsTokens
        stakedSuppliersTokens
        stakedGatewaysTokens
        size
        supplies {
          nodes {
            supply {
              denom
              amount
            }
          }
        }
        metadata {
          header
          lastCommit
          blockId
        }
      }
    }
  }
`

type BlockWithHeight = Omit<Block, 'id'> & {
  height: Block['id']
}

export type BlockResponseFromRpc = {
  block_id: {
    hash: string
    part_set_header: {
      total: number
      hash: string
    }
  }
  block: {
    header: {
      version: {
        block: string
        app: string
      }
      chain_id: string
      height: string
      time: string
      last_block_id: {
        hash: string
        part_set_header: {
          total: number
          hash: string
        }
      }
      last_commit_hash: string
      data_hash: string
      validators_hash: string
      next_validators_hash: string
      consensus_hash: string
      app_hash: string
      last_results_hash: string
      evidence_hash: string
      proposer_address: string
    }
    data: {
      txs: Array<any>
    }
    evidence: {
      evidence: Array<any>
    }
    last_commit: {
      height: string
      round: number
      block_id: {
        hash: string
        part_set_header: {
          total: number
          hash: string
        }
      }
      signatures: Array<{
        block_id_flag: string
        validator_address: string
        timestamp: string
        signature: string
      }>
    }
  }
  sdk_block: {
    header: {
      version: {
        block: string
        app: string
      }
      chain_id: string
      height: string
      time: string
      last_block_id: {
        hash: string
        part_set_header: {
          total: number
          hash: string
        }
      }
      last_commit_hash: string
      data_hash: string
      validators_hash: string
      next_validators_hash: string
      consensus_hash: string
      app_hash: string
      last_results_hash: string
      evidence_hash: string
      proposer_address: string
    }
    data: {
      txs: Array<any>
    }
    evidence: {
      evidence: Array<any>
    }
    last_commit: {
      height: string
      round: number
      block_id: {
        hash: string
        part_set_header: {
          total: number
          hash: string
        }
      }
      signatures: Array<{
        block_id_flag: string
        validator_address: string
        timestamp: string
        signature: string
      }>
    }
  }
}

export type BlockResponse = {
  height: string
  timestamp: string
  transactions: number
  took: number | null
  proposerAddress: string
  size: number | null
  totalSupply: string | null
  stakedAppsTokens: number | null
  stakedApps: number | null
  stakedSuppliersTokens: number | null
  stakedSuppliers: number | null
  stakedGatewaysTokens: number | null
  stakedGateways: number | null
  totalRelays: number | null
  totalComputedUnits: number | null
  metadata: {
    versionBlock: string
    versionApp: string
    chainId: string
    lastBlockId: string,
    lastBlockIdPartSetHeader: string,
    lastCommitHash: string
    dataHash: string
    validatorsHash: string
    nextValidatorsHash: string
    appHash: string
    lastResultsHash: string
    evidenceHash: string
  },
  lastCommit: {
    round: string,
    height: string,
    blockId: string,
    blockIdPartSetHeader: string,
    blockIdTotal: string,
  },
  signatures: Array<{
    signature: string,
    timestamp: string,
    validatorAddress: string,
    blockIdFlag: string,
  }>
}

function convertFromBase64ToHex(str: string): string {
  if (!str) return ''
  return toHex(fromBase64(str)).toUpperCase()
}

function truncateIsoDate(date: string): string {
  const splitted = date.split('.')
  return splitted.slice(0, -1).join('.') + '.' + splitted.at(-1)!.slice(0, 3) + 'Z'
}

/** BlockIdFlag indicates which BlockID the signature is for */
export enum BlockIDFlag {
  /** BLOCK_ID_FLAG_UNKNOWN - indicates an error condition */
  UNKNOWN = 'Unknown',
  /** BLOCK_ID_FLAG_ABSENT - the vote was not received */
  ABSENT = 'Absent',
  /** BLOCK_ID_FLAG_COMMIT - voted for the block that received the majority */
  COMMIT = 'Commit',
  /** BLOCK_ID_FLAG_NIL - voted for nil */
  NIL = 'Nil',
  UNRECOGNIZED = 'Unrecognized',
}

export function blockIDFlagFromJSON(object: string | number): BlockIDFlag {
  switch (object) {
    case 0:
    case "BLOCK_ID_FLAG_UNKNOWN":
      return BlockIDFlag.UNKNOWN;
    case 1:
    case "BLOCK_ID_FLAG_ABSENT":
      return BlockIDFlag.ABSENT;
    case 2:
    case "BLOCK_ID_FLAG_COMMIT":
      return BlockIDFlag.COMMIT;
    case 3:
    case "BLOCK_ID_FLAG_NIL":
      return BlockIDFlag.NIL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return BlockIDFlag.UNRECOGNIZED;
  }
}

export async function getBlockFromRpc(id: string, rpcUrl: string): Promise<BlockResponse | null> {
  const block = await fetch(getUrl(rpcUrl, 'block', id)).then(res => {
    if (res.status === 404) {
      return null
    } else {
      return res.json().then(res => res)
    }
  }) as BlockResponseFromRpc

  if (!block) {
    return null
  }

  return {
    height: block.block.header.height,
    timestamp: truncateIsoDate(block.block.header.time),
    transactions: block.block.data.txs.length,
    took: null,
    proposerAddress: block.sdk_block.header.proposer_address,
    size: null,
    totalSupply: null,
    stakedAppsTokens: null,
    stakedApps: null,
    stakedSuppliersTokens: null,
    stakedSuppliers: null,
    stakedGatewaysTokens: null,
    stakedGateways: null,
    totalRelays: null,
    totalComputedUnits: null,
    metadata: {
      versionBlock: block.block.header.version.block,
      versionApp: block.block.header.version.app,
      chainId: block.block.header.chain_id,
      lastBlockId: convertFromBase64ToHex(block.block.header.last_block_id.hash),
      lastBlockIdPartSetHeader: convertFromBase64ToHex(block.block.header.last_block_id.part_set_header.hash),
      lastCommitHash: convertFromBase64ToHex(block.block.header.last_commit_hash),
      dataHash: convertFromBase64ToHex(block.block.header.data_hash),
      validatorsHash: convertFromBase64ToHex(block.block.header.validators_hash),
      nextValidatorsHash: convertFromBase64ToHex(block.block.header.next_validators_hash),
      appHash: convertFromBase64ToHex(block.block.header.app_hash),
      lastResultsHash: convertFromBase64ToHex(block.block!.header.last_results_hash),
      evidenceHash: convertFromBase64ToHex(block.block.header.evidence_hash),
    },
    lastCommit: {
      round: block.block.last_commit.round.toString(),
      height: block.block.last_commit.height,
      blockId: convertFromBase64ToHex(block.block.last_commit.block_id.hash),
      blockIdPartSetHeader: convertFromBase64ToHex(block.block.last_commit.block_id.part_set_header.hash),
      blockIdTotal: block.block.last_commit.block_id.part_set_header.total.toString(),
    },
    signatures: block.block.last_commit.signatures.map((signature) => ({
      signature: convertFromBase64ToHex(signature.signature),
      timestamp: signature.timestamp === '0001-01-01T00:00:00Z' ? '' : truncateIsoDate(signature.timestamp),
      validatorAddress: convertFromBase64ToHex(signature.validator_address),
      blockIdFlag: blockIDFlagFromJSON(signature.block_id_flag),
    })),
  }
}



async function getBlockFromIndexer(id: string, apolloClient: ApolloClient<any>): Promise<BlockResponse | null> {
  let block: BlockWithHeight | null = null

  if (isNaN(Number(id))) {
    const {data} = await apolloClient.query({
      query: blockByHashDocument,
      variables: {hash: id.toUpperCase()}
    })

    block = data.blocks?.nodes?.at(0) as unknown as BlockWithHeight
  } else {
    const {data} = await apolloClient.query({
      query: blockByHeightDocument,
      variables: {height: id}
    })

    block = data.block as unknown as BlockWithHeight
  }

  if (!block) {
    return null
  }

  return {
    height: block.height,
    timestamp: block.timestamp,
    transactions: block.totalTxs || 0,
    took: block.timeToBlock!,
    proposerAddress: block.proposerAddress,
    size: block.size,
    totalSupply: block.supplies.nodes.find((item) => item?.supply?.denom === 'upokt')?.supply?.amount,
    stakedAppsTokens: block.stakedAppsTokens,
    stakedApps: block.stakedApps!,
    stakedSuppliersTokens: block.stakedSuppliersTokens,
    stakedSuppliers: block.stakedSuppliers!,
    stakedGatewaysTokens: block.stakedGatewaysTokens,
    stakedGateways: block.stakedGateways!,
    totalRelays: block.totalRelays,
    totalComputedUnits: block.totalComputedUnits,
    metadata: {
      versionBlock: block.metadata!.header.version.block,
      versionApp: block.metadata!.header.version.app,
      chainId: block.metadata!.header.chainId,
      lastBlockId: block.metadata!.header.lastBlockId.hash,
      lastBlockIdPartSetHeader: block.metadata!.header.lastBlockId.parts.hash,
      lastCommitHash: block.metadata!.header.lastCommitHash,
      dataHash: block.metadata!.header.dataHash,
      validatorsHash: block.metadata!.header.validatorsHash,
      nextValidatorsHash: block.metadata!.header.nextValidatorsHash,
      appHash: block.metadata!.header.appHash,
      lastResultsHash: block.metadata!.header.lastResultsHash,
      evidenceHash: block.metadata!.header.evidenceHash,
    },
    lastCommit: {
      round: block.metadata!.lastCommit.round,
      height: block.metadata!.lastCommit.height,
      blockId: block.metadata!.lastCommit.blockId.hash,
      blockIdPartSetHeader: block.metadata!.lastCommit.blockId.parts.hash,
      blockIdTotal: block.metadata!.lastCommit.blockId.parts.total,
    },
    signatures: block.metadata!.lastCommit.signatures.map((signature) => ({
      signature: signature.signature,
      timestamp: signature.timestamp,
      validatorAddress: signature.validatorAddress,
      blockIdFlag: blockIDFlagFromJSON(signature.blockIdFlag),
    }))
  }
}

export type GetBlockResult = Awaited<ReturnType<typeof getBlock>>

const getBlock = cache(async function getBlockCacheFn(id: string, rpcUrl: string, apolloClient: ApolloClient<any>) {
  return await fetchDataFromRpcOrIndexer({
    getFromIndexer: getBlockFromIndexer,
    getFromRpc: getBlockFromRpc,
    id,
    rpcUrl,
    apolloClient,
    isBlock: true,
  })
})

export default getBlock
