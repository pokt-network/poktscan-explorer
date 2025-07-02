'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import React from 'react'
import { useMultipleOptionContext } from '@/app/context/MultipleOptionContext'

interface GroupAllSwitchProps {
  disabled?: boolean
}

export default function GroupAllSwitch({disabled}: GroupAllSwitchProps) {
  const {selectedValue, setSelectedValue} = useMultipleOptionContext<boolean>()

  return (
    <div className={'flex items-center gap-2 text-xs'}>
      <Switch
        id={'group-all-addresses'}
        disabled={disabled}
        checked={selectedValue}
        onCheckedChange={setSelectedValue}
      />
      <Label htmlFor={'group-all-addresses'} className={'text-xs sm:text-sm font-medium'}>
        Group All
      </Label>
    </div>
  )
}
