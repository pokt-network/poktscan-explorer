'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react';
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import useDebounce from '@/app/hooks/useDebounce'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useExpandContext } from '@/app/appbar/Routes/ExpandContext'
import { usePathname } from 'next/navigation'
import { getLabelOfRouteIsActive } from '@/app/appbar/Routes/utils'

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
  const pathname = usePathname()
  const isActive = getLabelOfRouteIsActive({label, pathname})

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  const isSmOrLess = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)');

    const handleMediaQueryChange = (event: MediaQueryListEvent | MediaQueryList) => {
      isSmOrLess.current = !event.matches;
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    isSmOrLess.current = !mediaQuery.matches;

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, [])

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
        <Button variant={'ghost'} className={`hover:text-sky-500${(open || isActive) && ' text-sky-500'} light:font-bold px-4`}>
          {label}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[160px] border-[color:--divider] rounded-b-lg rounded-t-none border-t bg-[color:--main-background] relative px-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        align={'end'}
        alignOffset={12}
      >
        <div className={"absolute top-0 left-0 w-full h-[3px] bg-sky-500"} />
        <div className="grid gap-2">
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <hr key={index} className="border-[--divider]" />
              )
            }

            return (
              <SingleRouteItem
                label={item.label}
                href={item.href}
                key={item.href}
                onClick={() => {
                  if (!isSmOrLess.current) {
                    setOpen(false);
                  }
                }}
              />
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface RoutesGroup {
  label: string
  items: Array<DividerItem | RouteItem>
  type: 'group'
}

interface SingleRoute {
  label: string
  href: string
  type: 'single'
}

export interface RoutesAccordionProps {
  routeGroups: Array<RoutesGroup | SingleRoute>
}

export function RoutesAccordion({routeGroups}: RoutesAccordionProps) {
  const {collapse} = useExpandContext()
  const pathname = usePathname()

  return (
    <Accordion type={'single'} collapsible className={'gap-2'}>
      {routeGroups.map((item) => {
        if (item.type === 'single') {
          return (
            <RouteSingle
              key={item.href}
              href={item.href}
              label={item.label}
              onClick={collapse}
            />
          )
        } else {
          const {label, items} = item
          const isActive = getLabelOfRouteIsActive({label, pathname})

          return (
            <AccordionItem value={label} key={label} className={'border-none'}>
              <AccordionTrigger className={`hover:text-sky-500 aria-expanded:text-sky-500 h-[32px] my-0.5 font-normal ${isActive && 'text-sky-500'}`}>
                {label}
              </AccordionTrigger>
              <AccordionContent className={'p-3 border border-[color:--divider] rounded-md flex flex-col gap-2'}>
                {items.map((item, index) => {
                  if (item.type === 'divider') {
                    return (
                      <hr key={index} className="border-neutral-800 my-[0]" />
                    )
                  }

                  return (
                    <SingleRouteItem
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      onClick={collapse}
                    />
                  )
                })}
              </AccordionContent>
            </AccordionItem>
          )
        }
      })}
    </Accordion>
  )
}

interface RouteSingleProps {
  label: string
  href: string
  onClick?: () => void
}

export function RouteSingle({label, href, onClick}: RouteSingleProps) {
  const pathname = usePathname()
  const isActive = getLabelOfRouteIsActive({label, pathname, href})

  return (
    <Link
      href={href}
      className={`hover:text-sky-500 h-[32px] font-normal ${isActive && 'text-sky-500'}`}
      onClick={onClick}
    >
      <Button variant={'ghost'} className={'px-0 lg:px-4'}>
        {label}
      </Button>
    </Link>
  )
}

interface SingleRouteItemProps extends Omit<SingleRoute, 'type'> {
  onClick?: () => void
}

export function SingleRouteItem({href, label, onClick}: SingleRouteItemProps) {
  const pathname = usePathname()
  const isActive = getLabelOfRouteIsActive({label, pathname, href})

  return (
    <Link
      href={href}
      className={`text-xs block text-[color:--foreground] decoration-none rounded-md p-2 hover:bg-[color:--highlight-option] ${isActive && 'text-sky-500'}`}
      onClick={onClick}
    >
      {label}
    </Link>
  )
}
