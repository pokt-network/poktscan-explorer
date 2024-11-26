'use client'

import React, { useState } from 'react'
import useDebounce from '@/app/hooks/useDebounce'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PopoverArrow } from '@radix-ui/react-popover'

interface StatusPopoverProps {
  trigger: React.ReactNode
  content: React.ReactNode
}

export default function StatusPopover({trigger, content}: StatusPopoverProps) {
  const [open, setOpen] = useState(false);
  const debouncedOpen = useDebounce(open, 200);

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <Popover open={debouncedOpen} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={e => {
          e.preventDefault();
        }}
        className={'cursor-pointer'}
      >
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        side={"bottom"}
        sideOffset={5}
        className={'p-2 bg-[color:--main-background] z-[1025] rounded-lg border border-[color:--divider] min-w-0 w-auto text-xs'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
        <PopoverArrow className={'mt-[-1px] fill-[color:--main-background] stroke-[color:--divider] stroke-2'} />
      </PopoverContent>
    </Popover>
  )
}
