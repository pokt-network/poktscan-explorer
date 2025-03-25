'use client'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import React from 'react'
import { useExpandContext } from '@/app/appbar/Routes/ExpandContext'

export default function RoutesExpand() {
  const {toggle} = useExpandContext()

  return (
      <Button
        size={'icon'}
        onClick={toggle}
        variant={'outline'}
        className={'border-[color:--divider] rounded-md h-[34px] w-[34px] lg:hidden'}
      >
        <Menu className={'h-4 w-4'}/>
      </Button>
    )
}
