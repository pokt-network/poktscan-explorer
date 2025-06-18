import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import React, { Suspense } from 'react'
import JsonViewer from '@/app/components/JsonViewer'
import { getMessages } from '@/app/(details)/tx/[id]/getTx'
import { Skeleton } from '@/components/ui/skeleton'

const rpcUrl = process.env.RPC_BASE_URL!

export function Card({children}: React.PropsWithChildren) {
  return (
    <div
      className={"bg-[color:--main-background] px-4 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow py-2 md:min-h-[400px] md:max-h-[600px] md:overflow-y-auto"}
    >
      {children}
    </div>
  )
}

export function MessagesLoader() {
  const row = (
    <div className={'h-[56px] flex flex-row items-center gap-2 border-b border-[color:--divider]'}>
      <Skeleton className={'h-5 w-[80px]'} />
      <Skeleton className={'h-5 w-[200px]'} />
    </div>
  )

  return (
    <div>
      {row}
      {row}
      {row}
      {row}
    </div>
  )
}


interface MessagesProps {
  hash: string
}

async function ServerMessages({hash}: MessagesProps) {
  const messages = await getMessages(hash, rpcUrl)

  return (
    <DisplayMessages messages={messages} />
  )
}

export function DisplayMessages({messages}: {messages: Array<{typeUrl: string, json: string}>}) {
  return (
    <Accordion type={'multiple'}>
      {messages.map((node, index) => (
        <AccordionItem value={index.toString()} key={index.toString()}
                       className={index === messages.length - 1 ? 'border-none' : undefined}>
          <AccordionTrigger className={'flex flex-row gap-2 min-w-0 justify-start items-center'}>
            <span className={'font-semibold'}>
              {node.typeUrl.split('.').at(-1)?.replace('Msg', '')}
            </span>
            {
              node.typeUrl.includes('.') && (
                <p className={'whitespace-nowrap overflow-hidden overflow-ellipsis text-[color:--secondary]'}>
                  {node.typeUrl}
                </p>
              )
            }
          </AccordionTrigger>
          <AccordionContent className={'p-4 bg-[color:--background]'}>
            <JsonViewer json={JSON.parse(node.json)} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default async function Messages({hash}: MessagesProps) {
  return (
    <Card>
      <Suspense
        fallback={
          <MessagesLoader />
        }
      >
        <ServerMessages hash={hash} />
      </Suspense>
    </Card>
  )
}
