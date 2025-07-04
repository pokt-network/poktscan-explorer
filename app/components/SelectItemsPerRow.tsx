'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React from 'react'
import { getNewPageHref } from '@/app/components/Table'
import { useRouter } from 'next/navigation'

interface SelectItemsPerRowProps {
  currentPage: number
  value: number
  options: Array<number>
  basePath: string
  activeFilter?: string
}

export default function SelectItemsPerRow({value, currentPage, basePath, options, activeFilter}: SelectItemsPerRowProps) {
  const router = useRouter()

  return (
    <Select value={value.toString()} onValueChange={(newValue) => {
      const newUrl = getNewPageHref({
        newPage: currentPage,
        itemsPerPage: Number(newValue),
        basePath,
        filter: activeFilter,
        resetPage: true
      })

      router.push(newUrl)
    }}>
      <SelectTrigger className={"w-[80px] h-[30px] text-xs"}>
        <SelectValue placeholder={"Items"} />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem key={item} value={item.toString()}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
