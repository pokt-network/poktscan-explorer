import { getBlock } from '@/app/block/[id]/utils'
import EntityDetail from '@/app/components/EntityDetail'
import React from 'react'

interface MetadataProps {
  id: string
}

export default async function Metadata({id}: MetadataProps) {
  const block = await getBlock(id)

  return (
    <div className={"bg-[color:--main-background] p-4 rounded-lg border border-[color:--divider] flex flex-col base-shadow [&_p]:text-xs [&_div]:shadow-none"}>
      <h2 className={"text-lg font-semibold mb-2"}>
        Header
      </h2>
      <EntityDetail
        items={[
          {
            type: 'row',
            label: 'Version Block / App',
            value: `${block.metadata?.header?.version?.block} / ${block.metadata?.header?.version?.app}`
          },
          {
            type: 'row',
            label: 'Chain Id',
            value: block.metadata?.header?.chainId
          },
          {
            type: 'row',
            label: 'Last Block Id Hash',
            value: block.metadata?.header?.lastBlockId?.hash || '-'
          },
          {
            type: 'row',
            label: 'Last Block Id Parts',
            value: block.metadata?.header?.lastBlockId?.parts?.hash || '-'
          },
          {
            type: 'row',
            label: 'Last Commit Hash',
            value: block.metadata?.header?.lastCommitHash
          },
          {
            type: 'row',
            label: 'Data Hash',
            value: block.metadata?.header?.dataHash
          },
          {
            type: 'row',
            label: 'Validators Hash',
            value: block.metadata?.header?.validatorsHash
          },
          {
            type: 'row',
            label: 'Next Validators Hash',
            value: block.metadata?.header?.nextValidatorsHash
          },
          {
            type: 'row',
            label: 'App Hash',
            value: block.metadata?.header?.appHash
          },
          {
            type: 'row',
            label: 'Last Results Hash',
            value: block.metadata?.header?.lastResultsHash
          },
          {
            type: 'row',
            label: 'Evidence Hash',
            value: block.metadata?.header?.evidenceHash
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
                value: block.metadata?.lastCommit?.round
              },
              {
                type: 'row',
                label: 'Height',
                value: block.metadata?.lastCommit?.height
              },
              {
                type: 'row',
                label: 'Block Id Hash',
                value: block.metadata?.lastCommit?.blockId?.hash
              },
              {
                type: 'row',
                label: 'Block Id Parts / Total',
                value: `${block.metadata?.lastCommit?.blockId?.parts?.hash} / ${block.metadata?.lastCommit?.blockId?.parts?.total}`
              },
            ]}
          />
          <h3 className={"text-lg font-semibold mb-2 mt-4"}>
            Signatures
          </h3>
          <div className={'flex flex-col gap-4'}>
            {block.metadata?.lastCommit?.signatures.map((signature, index) => (
              <EntityDetail
                key={signature.signature}
                items={
                  [
                    {
                      type: 'row',
                      label: `Signature #${index + 1}`,
                      value: signature.signature
                    },
                    {
                      type: 'row',
                      label: 'Timestamp',
                      value: signature.timestamp
                    },
                    {
                      type: 'row',
                      label: 'Validator Address',
                      value: signature.validatorAddress
                    },
                    {
                      type: 'row',
                      label: 'Block Id Flag',
                      value: signature.blockIdFlag
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
