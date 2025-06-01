'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PocketLogo from '../assets/pocket_logo.svg'
import { useEffect, useState } from 'react'

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={"border flex items-center justify-center pt-[2px] bg-[color:--background] border-[color:--divider] rounded-md h-[34px] min-w-[34px] w-[34px]"}>
        <PocketLogo className={'scale-[1.05] pocket_logo'} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={"end"} className={'z-[1026] border-[color:--divider] bg-[color:--main-background] '}>
        <DropdownMenuLabel
          aria-disabled={isMainNetSelected}
          className={`flex flex-row font-medium items-center gap-2 ${isMainNetSelected ? 'text-[color:--primary]' : 'hover:bg-[color:--highlight-option]'}`}
        >
          <a
            className={'cursor-pointer w-full'}
            href={'https://poktscan.com'}
            target={'_blank'}
          >
            MainNet
          </a>
        </DropdownMenuLabel>
        <DropdownMenuLabel
          aria-disabled={isAlphaSelected}
          className={`flex flex-row font-medium items-center gap-2 ${isAlphaSelected ? 'text-[color:--primary]' : 'hover:bg-[color:--highlight-option]'}`}
        >
          <a
            className={'cursor-pointer w-full'}
            href={'https://alpha.poktscan.com'}
            target={'_blank'}
          >
            Alpha
          </a>
        </DropdownMenuLabel>
        <DropdownMenuLabel
          aria-disabled={isBetaSelected}
          className={`flex flex-row font-medium items-center gap-2 ${isBetaSelected ? 'text-[color:--primary]' : 'hover:bg-[color:--highlight-option]'}`}
        >
          <a
            className={'cursor-pointer w-full'}
            href={'https://beta.poktscan.com'}
            target={'_blank'}
          >
            Beta
          </a>
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
