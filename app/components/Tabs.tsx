'use client'

import Link from 'next/link'

export interface Tabs {
  label: string
  tab: string
}

interface TabsProps {
  tabs: Array<Tabs>
  basePath: string
  activeTab: string
}

export default function Tabs({tabs, activeTab, basePath}: TabsProps) {
  return (
    <div className={"flex flex-row gap-4"}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.tab

        if (isActive) {
          return (
            <span
              key={tab.tab}
              className={`text-xs px-[10px] font-semibold cursor-not-allowed select-none leading-[24px] py-1 rounded-lg transition-transform duration-300 bg-[color:--primary-background] text-white`}
            >
              {tab.label}
            </span>
          )
        }

        return (
          <Link
            className={`text-xs px-[10px] font-semibold aria-disabled:cursor-not-allowed leading-[24px] py-1 rounded-lg transition-transform duration-300 bg-[color:rgba(141,141,141,0.12)]`}
            href={
              basePath.includes('?') ?
                `${basePath}&tab=${tab.tab}`:
                `${basePath}?tab=${tab.tab}`
            }
            scroll={false}
            key={tab.tab}
            aria-disabled={isActive}
            prefetch={!isActive}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
