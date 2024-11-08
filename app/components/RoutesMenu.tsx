'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react';
import Link from 'next/link'
import { useState } from 'react'
import useDebounce from '@/app/hooks/useDebounce'

interface DividerItem {
  type: 'divider'
}

interface RouteItem {
  type: 'route'
  label: string
  href: string
}

interface RoutesMenuProps {
  items: Array<DividerItem | RouteItem>
  label: string
}

export default function RoutesMenu({label, items}: RoutesMenuProps) {
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
      >
        <Button variant={'ghost'} className={`hover:text-sky-500${open && ' text-sky-500'} light:font-bold`}>
          {label}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] border-[color:--divider] rounded-b-lg rounded-t-none border-t bg-[color:--main-background] relative px-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={"absolute top-0 left-0 w-full h-[3px] bg-sky-500"} />
        <div className="grid gap-4">
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <hr key={index} className="border-neutral-800 my-2" />
              )
            }

            return (
              <Link href={item.href} key={index} className={"text-sm text-[color:--foreground] decoration-none rounded-md py-1 px-2 hover:bg-[color:--highlight-option]"}>
                {item.label}
              </Link>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
