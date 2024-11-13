import React from 'react'
import { Eye } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import EntityLink, { EntityLinkProps } from '@/app/components/EntityLink'
import { PopoverArrow } from '@radix-ui/react-popover'

interface Items {
  label: React.ReactNode
  value: React.ReactNode
}

interface DetailCellProps {
  entityProps: EntityLinkProps
  rows: Array<Items>
}

export default function DetailCell({rows, entityProps}: DetailCellProps) {
  return (
    <div className={'w-full h-full flex items-center justify-center'}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={'outline'} size={'icon'} className={"border-[color:--divider] hover:bg-[color:--background] w-[30px] h-[30px]"}>
            <Eye className={'h-5 w-5 text-[color:--secondary]'} />
          </Button>
        </PopoverTrigger>
        <PopoverContent side={'left'} className={'w-[300px] p-4 rounded-lg bg-[color:--main-background] border border-[color:--divider]'}>
          <p className={'font-bold text-sm'}>
            Additional details
          </p>
          {rows.map((item, index) => (
            <div key={index} className={'flex flex-col py-4 border-b border-[color:--divider]'}>
              {['string','number'].includes(typeof item.label) ? (
                  <p className={'text-[13px] font-semibold'}>
                    {item.label}
                  </p>
                ) : (
                  item.label
                )
              }
              {['string','number'].includes(typeof item.value) ? (
                <p className={'text-[13px]'}>
                  {item.value}
                </p>
              ) : (
                item.value
              )}
            </div>
          ))}
          <div className={"pt-4 text-xs flex flex-row gap-1 items-center"}>
            <EntityLink {...entityProps} label={'See more details'} />
          </div>
          <PopoverArrow className={"mt-[-1px] h-[7px] fill-[color:--main-background] stroke-[color:--divider] stroke-2"} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
