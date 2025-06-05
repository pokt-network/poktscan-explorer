'use client'

import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { maxAddresses } from '@/app/dashboards/node-running/constants'

interface SearchByAddressProps {
  defaultValue?: string
}

export default function AddressesInput({defaultValue}: SearchByAddressProps) {
  const [searchValue, setSearchValue] = useState(defaultValue || '')
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const inputIsValid = searchValue.split(',').every(isValidPoktAddress)

  return (
    <div>
      <div className={'flex flex-row items-center gap-4'}>
        <Textarea
          className={'max-w-[600px] min-h-[100px] max-h-[300px] border-[color:--divider] bg-[color:--main-background] placeholder:text-[color:--secondary] text-xs md:text-sm'}
          placeholder={'Search by Shannon addresses'}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Button
          variant={'outline'}
          className={'border-[color:--divider]'}
          disabled={!inputIsValid || searchValue === (defaultValue || '')}
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.set('addresses', searchValue.split(',').slice(0, maxAddresses).join(','))
            router.push(`${pathname}?${newSearchParams.toString()}`)
          }}
        >
          Search
        </Button>
      </div>
      <p className={'text-[color:--secondary] text-xs mt-2'}>
        Enter a comma-separated list of Delegator addresses to search for. Max addresses allowed: {maxAddresses}.
      </p>
    </div>
  )
}
