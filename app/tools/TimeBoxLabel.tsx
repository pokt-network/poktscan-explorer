'use client'

import { getTimeBoxLabel } from '@/app/utils/dates'
import BoxLabel from '@/app/components/BoxLabel'
import React from 'react'
import { useSelectedTime } from '@/app/Charts/SelectedTime'

export default function TimeBoxLabel() {
  const {selectedTime} = useSelectedTime()

  return <BoxLabel label={getTimeBoxLabel(selectedTime)} />
}
