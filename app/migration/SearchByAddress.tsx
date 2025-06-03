'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { isValidMorseAddress, isValidPoktAddress } from '@/app/utils/poktroll'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchByAddressProps {
  defaultValue?: string
}

export default function SearchByAddress({defaultValue}: SearchByAddressProps) {
  const [searchValue, setSearchValue] = useState(defaultValue || '')
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <div className={'flex flex-row items-center gap-4'}>
      <Input
        className={'w-[400px] h-[40px] border-[color:--divider] bg-[color:--main-background] placeholder:text-[color:--secondary] text-xs md:text-sm'}
        placeholder={'Search by Morse/Shannon address'}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <Button
        variant={'outline'}
        className={'border-[color:--divider]'}
        disabled={searchValue === (defaultValue || '')  || (!isValidPoktAddress(searchValue) && !isValidMorseAddress(searchValue))}
        onClick={() => {
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.set('address', searchValue)
          router.push(`/migration?${newSearchParams.toString()}`)
        }}
      >
        Search
      </Button>
    </div>
  )
}
