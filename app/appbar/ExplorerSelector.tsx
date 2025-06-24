'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEffect, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ExplorerSelector() {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { origin } = window.location;
      setOrigin(origin);
    }
  }, [])

  const isAlphaSelected = origin.includes('alpha')
  const isBetaSelected = origin.includes('beta')

  const isMainNetSelected = origin.includes('poktscan.com') && !isAlphaSelected && !isBetaSelected

  const check = (
    <Check className={'h-4 w-4 text-[color:--secondary] dark:text-white'} />
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={"border flex items-center justify-center pt-[2px] border-[color:--divider] rounded-xs h-[28px] gap-2 px-2"}>
        {!origin ? (
            <Skeleton className={'h-4 w-16'} />
          ) : (
          <>
            <p className={'text-[13px] font-medium dark:text-white'}>
              {isAlphaSelected ? 'Alpha' : isBetaSelected ? 'Beta' : 'MainNet'}
            </p>
            <ChevronDown className={'h-4 w-4 text-[color:--secondary]'} />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={"end"} className={'z-[1026] border-[color:--divider] bg-[color:--main-background] '}>
        <DropdownMenuLabel
          aria-disabled={isMainNetSelected}
          className={`flex flex-row font-medium justify-between items-center gap-2`}
        >
          <a
            className={'cursor-pointer w-full'}
            href={'https://poktscan.com'}
            target={'_blank'}
          >
            MainNet
          </a>
          {isMainNetSelected && check}
        </DropdownMenuLabel>
        <DropdownMenuLabel
          aria-disabled={isAlphaSelected}
          className={`flex flex-row font-medium justify-between items-center gap-2`}
        >
          <a
            className={'cursor-pointer w-full'}
            href={'https://alpha.poktscan.com'}
            target={'_blank'}
          >
            Alpha
          </a>
          {isAlphaSelected && check}
        </DropdownMenuLabel>
        <DropdownMenuLabel
          aria-disabled={isBetaSelected}
          className={`flex flex-row font-medium justify-between items-center gap-2`}
        >
          <a
            className={'cursor-pointer w-full'}
            href={'https://beta.poktscan.com'}
            target={'_blank'}
          >
            Beta
          </a>
          {isBetaSelected && check}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel
          aria-disabled={isBetaSelected}
          className={`flex flex-row font-medium items-center gap-2 hover:bg-[color:--highlight-option]`}
        >
          <a
            className={'cursor-pointer w-full'}
            href={'https://morse.poktscan.com'}
            target={'_blank'}
          >
            Morse
          </a>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
