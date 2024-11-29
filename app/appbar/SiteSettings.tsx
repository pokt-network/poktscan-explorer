'use client'

import {useTheme} from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sun, Moon, Clock } from 'lucide-react'
import DateSettingsDialog from '@/app/appbar/DateSettings'
import { useState } from 'react'

export default function SiteSettings() {
  const {setTheme} = useTheme()
  const [openMenu, setOpenMenu] = useState(false)
  const [openDateDialog, setOpenDateDialog] = useState(false)

  return (
    <>
      <DateSettingsDialog
        open={openDateDialog}
        onOpenChange={setOpenDateDialog}
      />
      <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
        <DropdownMenuTrigger className={"border p-2 bg-[color:--background] border-[color:--divider] rounded-md h-[34px] w-[34px]"}>
          <Sun className={"h-4 w-4 dark:hidden stroke-sky-600"}/>
          <Moon className={"h-4 w-4 hidden dark:block stroke-sky-600"}/>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={"end"} className={'z-[1026] border-[color:--divider] bg-[color:--main-background] '}>
          <DropdownMenuLabel
            onClick={() => {
              setTheme('light')
              setOpenMenu(false)
            }}
            className={"flex font-medium text-xs flex-row items-center gap-2 hover:bg-[color:--highlight-option] cursor-pointer"}
          >
            <Sun className="h-4 w-4" />
            Light
          </DropdownMenuLabel>
          <DropdownMenuLabel
            onClick={() => {
              setOpenMenu(false)
              setTheme('dark')
            }}
            className={"flex font-medium text-xs flex-row items-center gap-2 hover:bg-[color:--highlight-option] cursor-pointer"}
          >
            <Moon className="h-4 w-4" />
            Dark
          </DropdownMenuLabel>
          <hr className={"border-[color:--divider] my-1 mx-1"} />
          <DropdownMenuLabel
            onClick={() => {
              setOpenDateDialog(true)
              setOpenMenu(false)
            }}
            className={"flex font-medium text-xs flex-row items-center gap-2 hover:bg-[color:--highlight-option] cursor-pointer"}
          >
            <Clock className="h-4 w-4" />
            Date Settings
          </DropdownMenuLabel>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
