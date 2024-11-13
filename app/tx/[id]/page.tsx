import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import EntityLink from '@/app/components/EntityLink'
import { formatBalance } from '@/app/utils/balances'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const txByIdDocument = graphql(`
  query transaction($id: String!) {
    transaction(id: $id) {
      id
      code
      codespace
      block {
        timestamp
        height
      }
      gasUsed
      gasWanted
      signerAddress
      fees
      memo
      messages {
        nodes {
          typeUrl
          json
        }
      }
    }
  }
`)

export default async function TransactionDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = await params

  const {data} = await getClient().query({
    query: txByIdDocument,
    variables: {id}
  })

  const tx = data.transaction

  if (!tx) {
    return (
      <div>
        not found
      </div>
    )
  }

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Signer',
      description: 'First signer of the transaction',
      value: (
        <div className={'text-sm'}>
          <EntityLink
            entity={'account'}
            entityId={tx.signerAddress}
            copy={{
              enabled: true
            }}
          />
        </div>
      )
    },
    {
      type: 'row',
      label: 'Status',
      value: (
        <div className={'flex flex-row items-center gap-2'}>
          <p className={`text-sm ${tx.code === 0 ? 'text-[color:--success]' : 'text-[color:--error]'} font-semibold`}>
            {tx.code === 0 ? 'Success' : 'Failed'}
          </p>
          {tx.code !== 0 && (
            <div className={'text-sm text-[color:--secondary] bg-[color:--background] border border-[color:--divider] px-4 py-1 rounded-md'}>
              code:{tx.code}
            </div>
          )}
        </div>
      )
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Height',
      value: (
        <div className={'text-sm'}>
          <EntityLink
            entity={'block'}
            entityId={tx.block.height}
            copy={{
              enabled: true
            }}
          />
        </div>
      )
    },
    {
      type: 'row',
      label: 'Timestamp',
      value: tx.block.timestamp
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Gas Used / Wanted',
      value: `${tx.gasUsed} / ${tx.gasWanted}`
    },
    {
      type: 'row',
      label: 'Fee',
      value: formatBalance(tx.fees.at(0) || {
        amount: '0',
        denom: 'upokt'
      })
    }
  ]

  if (tx.code !== 0) {
    rows.splice(2, 0, ...[
      {
        type: 'row',
        label: 'Code',
        value: tx.code
      },
      {
        type: 'row',
        label: 'Codespace',
        value: tx.codespace
      }
    ])
  }

  if (tx.memo) {
    rows.push({
      type: 'divider'
    },{
      type: 'row',
      label: 'Memo',
      value: tx.memo
    })
  }

  return (
    <div className={"p-10 gap-5 flex flex-col"}>
      <div className={"flex flex-row items-center gap-3"}>
        <h1 className={'text-2xl font-semibold'}>
          Tx
        </h1>
        <p className={'text-lg text-[color:--secondary] whitespace-nowrap overflow-hidden overflow-ellipsis'}>
          {tx.id}
        </p>
      </div>
      <EntityDetail
        items={rows}
      />
      <h2 className={"text-xl font-semibold"}>
        Messages
      </h2>
      <div className={"bg-[color:--main-background] p-4 rounded-lg border border-[color:--divider] flex flex-col gap-4"}>
        <Accordion type={'multiple'} defaultValue={['0']}>
          {tx.messages.nodes.map((node, index) => (
            <AccordionItem value={index.toString()} key={index.toString()} className={index === tx.messages.nodes.length - 1 ? 'border-none' : undefined}>
              <AccordionTrigger className={'flex flex-row gap-2 justify-start items-center'}>
                {node.typeUrl.split('.').at(-1).replace('Msg','')}
                <p className={'whitespace-nowrap overflow-hidden overflow-ellipsis text-[color:--secondary]'}>
                  {node.typeUrl}
                </p>
              </AccordionTrigger>
              <AccordionContent className={"whitespace-pre"}>
                {JSON.stringify(JSON.parse(node.json), null, 4)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )

}
