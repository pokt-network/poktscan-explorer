import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import React from 'react'
import JsonViewer from '@/app/components/JsonViewer'

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
            <JsonViewer json={JSON.parse(node.json)} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
