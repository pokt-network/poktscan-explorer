'use client'

import { CircleAlert } from 'lucide-react'
import React, { useState } from 'react'
import useDebounce from '@/app/hooks/useDebounce'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PopoverArrow } from '@radix-ui/react-popover'

interface FailedTransactionFeedbackProps {
  text?: string
}

export default function FailedTransactionFeedback({
  text = 'Transaction failed'
}: FailedTransactionFeedbackProps) {
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
        <CircleAlert className={'h-4 min-w-4 w-4 text-[color:--error]'} />
      </PopoverTrigger>
      <PopoverContent
        side={"bottom"}
        sideOffset={5}
        className={'p-2 bg-[color:--main-background] z-[1025] rounded-lg border border-[color:--divider] min-w-0 w-auto text-xs'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <p>{text}</p>
        <PopoverArrow className={'mt-[-1px] fill-[color:--main-background] stroke-[color:--divider] stroke-2'} />
      </PopoverContent>
    </Popover>


  )
}
