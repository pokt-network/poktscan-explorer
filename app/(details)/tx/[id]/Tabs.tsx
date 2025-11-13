import Messages from '@/app/(details)/tx/[id]/Messages'
import React from 'react'
import RawEntity from '@/app/components/RawEntity/RawEntity'
import Tabs from '@/app/components/Tabs'
import Events from '@/app/(details)/tx/[id]/Events'

const validTabs = ['messages', 'events', 'raw']

export default function TransactionTabs({tab, hash, rpcUrl}: TransactionTabsProps) {
  const activeTab = validTabs.includes(tab) ? tab : 'messages'

  let element: React.ReactNode

  switch (tab) {
    case 'messages':
      element = <Messages hash={hash} rpcUrl={rpcUrl!} />
      break
    case 'events':
      element = <Events hash={hash} rpcUrl={rpcUrl!} />
      break
    case 'raw':
      element = (
        <RawEntity
          entity={'tx'}
          id={hash}
          rpcUrl={rpcUrl}
        />
      )
      break
  }

  const tabs = [
    {
      label: 'Messages',
      tab: "messages"
    },
    {
      label: 'Events',
      tab: "events"
    },
    {
      label: 'Raw Result',
      tab: "raw"
    }
  ]

  return (
    <>
      <Tabs tabs={tabs} basePath={`/tx/${hash}`} activeTab={activeTab} />
      {element}
    </>
  )
}

interface TransactionTabsProps {
  tab: string
  hash: string
  rpcUrl?: string
}
