'use client'

import EntityDetail from '@/app/components/EntityDetail'
import React, { useEffect, useState } from 'react'
import { blockByHeightDocument, getBlockFromRpc, type BlockResponse } from '@/app/(details)/block/[id]/getBlock'
import SourceChips from '@/app/components/SourceChips'
import NoData from '@/app/components/NoData'
import { getUseRpcData } from '@/app/utils/metadata'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import useFetchOnBlock from '@/app/hooks/useFetchOnBlock'
import { useQuery } from '@apollo/client'
import { Skeleton } from '@/components/ui/skeleton'

const rpcUrl = process.env.NEXT_PUBLIC_RPC_BASE_URL!

interface MetadataProps {
  id: string
}

export default function Metadata({id}: MetadataProps) {
  const [rpcData, setRpcData] = useState<BlockResponse | null | undefined>(undefined)
  const [isLoadingRpc, setIsLoadingRpc] = useState(false)

  const { data: metadata, isLoading: isLoadingMetadata } = useFetchOnBlock({
    query: indexerMetadataDocument,
    initialResult: null,
    initialError: false
  })

  const useRpcData = metadata ? getUseRpcData(metadata) : false

  // Fetch from GraphQL when not using RPC
  const { data: graphqlData, loading: isLoadingGraphql } = useQuery(blockByHeightDocument, {
    variables: { height: id },
    skip: useRpcData || isLoadingMetadata
  })

  useEffect(() => {
    if (useRpcData && rpcData === undefined && !isLoadingRpc) {
      setIsLoadingRpc(true)
      getBlockFromRpc(id, rpcUrl)
        .then(data => {
          setRpcData(data)
          setIsLoadingRpc(false)
        })
        .catch(() => {
          setRpcData(null)
          setIsLoadingRpc(false)
        })
    }
  }, [useRpcData, id, rpcData, isLoadingRpc])

  if (isLoadingMetadata || (useRpcData && isLoadingRpc) || (!useRpcData && isLoadingGraphql)) {
    return (
      <div className={"bg-[color:--main-background] px-6 py-4 relative rounded-lg border border-[color:--divider] flex flex-col base-shadow [&_p]:text-xs [&_div]:shadow-none"}>
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
      </div>
    )
  }

  const block = useRpcData ? rpcData : (graphqlData?.block ? {
    height: graphqlData.block.height,
    timestamp: graphqlData.block.timestamp,
    transactions: graphqlData.block.totalTxs || 0,
    took: graphqlData.block.timeToBlock!,
    proposerAddress: graphqlData.block.proposerAddress,
    size: graphqlData.block.size,
    totalSupply: graphqlData.block.supplies.nodes.find((item: any) => item?.supply?.denom === 'upokt')?.supply?.amount,
    stakedAppsTokens: graphqlData.block.stakedAppsTokens,
    stakedApps: graphqlData.block.stakedApps!,
    stakedSuppliersTokens: graphqlData.block.stakedSuppliersTokens,
    stakedSuppliers: graphqlData.block.stakedSuppliers!,
    stakedGatewaysTokens: graphqlData.block.stakedGatewaysTokens,
    stakedGateways: graphqlData.block.stakedGateways!,
    totalRelays: graphqlData.block.totalRelays,
    totalComputedUnits: graphqlData.block.totalComputedUnits,
    metadata: {
      versionBlock: graphqlData.block.metadata!.header.version.block,
      versionApp: graphqlData.block.metadata!.header.version.app,
      chainId: graphqlData.block.metadata!.header.chainId,
      lastBlockId: graphqlData.block.metadata!.header.lastBlockId.hash,
      lastBlockIdPartSetHeader: graphqlData.block.metadata!.header.lastBlockId.parts.hash,
      lastCommitHash: graphqlData.block.metadata!.header.lastCommitHash,
      dataHash: graphqlData.block.metadata!.header.dataHash,
      validatorsHash: graphqlData.block.metadata!.header.validatorsHash,
      nextValidatorsHash: graphqlData.block.metadata!.header.nextValidatorsHash,
      appHash: graphqlData.block.metadata!.header.appHash,
      lastResultsHash: graphqlData.block.metadata!.header.lastResultsHash,
      evidenceHash: graphqlData.block.metadata!.header.evidenceHash,
    },
    lastCommit: {
      round: graphqlData.block.metadata!.lastCommit.round,
      height: graphqlData.block.metadata!.lastCommit.height,
      blockId: graphqlData.block.metadata!.lastCommit.blockId.hash,
      blockIdPartSetHeader: graphqlData.block.metadata!.lastCommit.blockId.parts.hash,
      blockIdTotal: graphqlData.block.metadata!.lastCommit.blockId.parts.total,
    },
    signatures: graphqlData.block.metadata!.lastCommit.signatures.map((signature: any) => ({
      signature: signature.signature,
      timestamp: signature.timestamp,
      validatorAddress: signature.validatorAddress,
      blockIdFlag: signature.blockIdFlag,
    }))
  } as BlockResponse : null)

  const source = useRpcData ? 'rpc' : 'indexer'

  let content: React.ReactNode = null

  if (!block) {
    content = (
      <NoData label={'Block not found'} />
    )
  } else {
    content = (
      <>
        <SourceChips source={source!} />
        <div className={'h-8'} />
        <h2 className={"text-lg font-semibold mb-2"}>
          Header
        </h2>
        <EntityDetail
          items={[
            {
              type: 'row',
              label: 'Version Block / App',
              value: `${block.metadata.versionBlock} / ${block.metadata.versionApp}`
            },
            {
              type: 'row',
              label: 'Chain Id',
              value: block.metadata.chainId
            },
            {
              type: 'row',
              label: 'Last Block Id Hash',
              value: block.metadata.lastResultsHash
            },
            {
              type: 'row',
              label: 'Last Block Id Parts',
              value: block.metadata.lastBlockIdPartSetHeader
            },
            {
              type: 'row',
              label: 'Last Commit Hash',
              value: block.metadata?.lastCommitHash
            },
            {
              type: 'row',
              label: 'Data Hash',
              value: block.metadata?.dataHash
            },
            {
              type: 'row',
              label: 'Validators Hash',
              value: block.metadata?.validatorsHash
            },
            {
              type: 'row',
              label: 'Next Validators Hash',
              value: block.metadata?.nextValidatorsHash
            },
            {
              type: 'row',
              label: 'App Hash',
              value: block.metadata?.appHash
            },
            {
              type: 'row',
              label: 'Last Results Hash',
              value: block.metadata?.lastResultsHash
            },
            {
              type: 'row',
              label: 'Evidence Hash',
              value: block.metadata?.evidenceHash
            },
          ]}
        />
        {block?.height !== "1" && (
          <>
            <h2 className={"text-lg font-semibold mb-2 mt-4"}>
              Last Commit
            </h2>
            <EntityDetail
              items={[
                {
                  type: 'row',
                  label: 'Round',
                  value: block.lastCommit.round
                },
                {
                  type: 'row',
                  label: 'Height',
                  value: block.lastCommit.round
                },
                {
                  type: 'row',
                  label: 'Block Id Hash',
                  value: block.lastCommit.blockId
                },
                {
                  type: 'row',
                  label: 'Block Id Parts / Total',
                  value: `${block.lastCommit.blockIdPartSetHeader} / ${block.lastCommit.blockIdTotal}`
                },
              ]}
            />
            <h3 className={"text-lg font-semibold mb-2 mt-4"}>
              Signatures
            </h3>
            <div className={'flex flex-col gap-4'}>
              {block.signatures.map((signature, index) => (
                <EntityDetail
                  key={signature.signature}
                  items={
                    [
                      {
                        type: 'row',
                        label: 'Block Id Flag',
                        value: signature.blockIdFlag
                      },
                      {
                        type: 'row',
                        label: `Signature #${index + 1}`,
                        value: signature.signature || '-'
                      },
                      {
                        type: 'row',
                        label: 'Timestamp',
                        value: signature.timestamp || '-'
                      },
                      {
                        type: 'row',
                        label: 'Validator Address',
                        value: signature.validatorAddress || '-'
                      },
                    ]
                  }
                />)
              )}
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <div className={"bg-[color:--main-background] px-6 py-4 relative rounded-lg border border-[color:--divider] flex flex-col base-shadow [&_p]:text-xs [&_div]:shadow-none"}>
      {content}
    </div>
  )
}
