'use client'

import {useTheme} from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sun, Moon } from 'lucide-react';

export default function SiteSettings() {
  const {setTheme} = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={"border p-2 bg-[color:--background] border-[color:--divider] rounded-md h-[34px] w-[34px]"}>
        <Sun className={"h-4 w-4 dark:hidden"}/>
        <Moon className={"h-4 w-4 hidden dark:block"}/>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={"end"} className={'z-[1026] border-[color:--divider] bg-[color:--main-background] '}>
        <DropdownMenuLabel onClick={() => setTheme('light')} className={"flex font-medium flex-row items-center gap-2 hover:bg-[color:--highlight-option] cursor-pointer"}>
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuLabel>
        <DropdownMenuLabel onClick={() => setTheme('dark')} className={"flex font-medium flex-row items-center gap-2 hover:bg-[color:--highlight-option] cursor-pointer"}>
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
