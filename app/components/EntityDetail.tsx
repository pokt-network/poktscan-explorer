import React from 'react'
import { CircleHelp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type DividerItem = {
  type: 'divider'
}

type LabelValueItem = {
  type: 'row'
  label: React.ReactNode
  value: React.ReactNode
  description?: string | React.ReactNode
}

export type Item = LabelValueItem | DividerItem

interface EntityDetailProps {
  items: Array<Item>
}

export default function EntityDetail({items}: EntityDetailProps) {
  return (
    <div className={"relative bg-[color:--main-background] px-5 py-4 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow"}>
      {items.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <hr key={index} className={"border-[color:--divider] my-1"}/>
          )
        }

        return (
          <div key={index} className={"flex flex-col md:flex-row gap-1 md:gap-2 px-1"}>
            <div className={"flex flex-row gap-1.5 items-start w-full md:w-[25%]"}>
              {
                item.description && (
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger className={'mt-[2px]'}>
                        <CircleHelp className={"w-4 h-4 text-[color:--secondary]"} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className={"p-2 bg-[color:--main-background] rounded-lg border border-[color:--divider]"}>
                          {item.description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              }
              <p className={"text-sm text-[color:--secondary] whitespace-nowrap overflow-hidden overflow-ellipsis"}>
                {item.label}
              </p>
            </div>
            <div className={"flex flex-row gap-1.5 items-center w-full md:w-[75%] md:min-w-[75%]"}>
              {['string', 'number'].includes(typeof item.value) ? (
                <p className={"text-sm text-[color:--foreground] break-all md:whitespace-nowrap md:overflow-hidden md:overflow-ellipsis"}>
                  {item.value}
                </p>
              ) : item.value}
            </div>
          </div>
        )
      })}
    </div>
  )
}
