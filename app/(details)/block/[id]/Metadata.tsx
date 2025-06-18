import EntityDetail from '@/app/components/EntityDetail'
import React from 'react'
import getBlock from '@/app/(details)/block/[id]/getBlock'
import { getClient } from '@/app/config/apollo/rsc'
import SourceChips from '@/app/components/SourceChips'

const rpcUrl = process.env.RPC_BASE_URL!

interface MetadataProps {
  id: string
}

export default async function Metadata({id}: MetadataProps) {
  const {data: block, source} = await getBlock(id, rpcUrl, getClient())

  if (!block) {
    return null
  }

  return (
    <div className={"bg-[color:--main-background] px-6 py-4 relative rounded-lg border border-[color:--divider] flex flex-col base-shadow [&_p]:text-xs [&_div]:shadow-none"}>
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
    </div>
  )
}
