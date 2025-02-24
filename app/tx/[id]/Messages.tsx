import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import React from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import { formatAmount } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'

const getMissingMessagesDocument = graphql(`
  query getMissingMessages($hash: String!, $cursor: Cursor!) {
    messages: messages(orderBy: ID_ASC,
      filter: {
        transactionId: { equalTo: $hash }
      },
      after: $cursor,
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        typeUrl
        json
      }
    }
  }
`)

interface Message {
  typeUrl: string
  json: string
}

interface MessagesProps {
  initialMessages: Array<Message>
  initialCursor: string
  totalMessages: number
  transactionId: string
}

export default async function Messages({transactionId,initialMessages, initialCursor, totalMessages}: MessagesProps) {
  let allMessages = [...initialMessages]

  if (totalMessages > initialMessages.length) {
    let currentCursor = initialCursor

    while (true) {
      const {data: missingMessagesData} = await getClient().query({
        query: getMissingMessagesDocument,
        variables: {
          hash: transactionId,
          cursor: currentCursor
        }
      })

      allMessages = allMessages.concat(missingMessagesData.messages?.nodes || [])
      currentCursor = missingMessagesData.messages?.pageInfo?.endCursor

      if (!missingMessagesData.messages?.pageInfo?.hasNextPage) {
        break
      }
    }
  }

  return (
    <DisplayMessages messages={allMessages} />
  )
}

export function DisplayMessages({messages}: {messages: Array<Message>}) {
  return (
    <Accordion type={'multiple'}>
      {messages.map((node, index) => (
        <AccordionItem value={index.toString()} key={index.toString()}
                       className={index === messages.length - 1 ? 'border-none' : undefined}>
          <AccordionTrigger className={'flex flex-row gap-2 min-w-0 justify-start items-center'}>
                  <span className={'font-semibold'}>
                    {node.typeUrl.split('.').at(-1)?.replace('Msg', '')}
                  </span>
            <p className={'whitespace-nowrap overflow-hidden overflow-ellipsis text-[color:--secondary]'}>
              {node.typeUrl}
            </p>
          </AccordionTrigger>
          <AccordionContent className={'p-4 bg-[color:--background]'}>
            {renderJSON(JSON.parse(node.json), 0)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function renderJSON(data: any, level = 0) {
  return (
    <div className={'flex flex-col gap-4 md:gap-[10px]'}>
      {Object.entries(data).map(([key, value]) => {
        const isObject = typeof value === 'object' && value !== null
        const areAmounts = (Array.isArray(value) && value.every((value) => 'amount' in value && 'denom' in value && Object.keys(value).length === 2)) || (isObject && 'amount' in value && 'denom' in value && Object.keys(value).length === 2)
        const isAddress = typeof value === 'string' && isValidPoktAddress(value)

        let valueComponent: React.ReactNode

        if (areAmounts) {
          const arr = !Array.isArray(value)? [value] : value
          valueComponent = (
            <p className={'text-xs font-medium whitespace-pre leading-[24px] md:leading-5 md:mt-[-4px] ml-[10px] md:ml-0'}>
              {arr.map((item) => formatAmount(item)).join('\n')}
            </p>
          )
        } else if (isObject) {
          valueComponent = renderJSON(value, level + 1)
        } else if (isAddress) {
          valueComponent = (
            <div className={'text-xs font-medium whitespace-nowrap overflow-hidden overflow-ellipsis mt-[-6px]'}>
              <EntityLink
                entity={'account'}
                entityId={value}
              />
            </div>
          )
        } else {
          valueComponent = (
            <p className={'text-xs font-medium whitespace-nowrap overflow-hidden overflow-ellipsis'}>
              {value}
            </p>
          )
        }

        return (
          <div key={key} className={'flex flex-col md:flex-row gap-1 md:gap-2'} style={{marginLeft: level * 5, flexDirection: isObject && !areAmounts ? 'column' : undefined}}>
            <p className={'text-[color:--secondary] text-xs font-semibold'} style={{width: 150 - (5 * level), minWidth: 150 - (5 * level)}}>
              {key}:
            </p>
            {valueComponent}
          </div>
        )
      })}
    </div>
  )
}

