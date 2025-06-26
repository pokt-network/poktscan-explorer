'use client'

import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import { Textarea } from '@/components/ui/textarea'
import { useSelectedAddresses } from '@/app/tools/SelectedAddresses'
import { getValidAddresses } from '@/app/tools/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { maxAddresses } from '@/app/tools/operator/constants'

interface SearchByAddressProps {
  defaultValue?: string
  inputHelperText: string
  pushOnChange?: boolean
}

export default function AddressesInput({defaultValue, inputHelperText, pushOnChange}: SearchByAddressProps) {
  const [searchValue, setSearchValue] = useState(defaultValue || '')
  const lastValueRef = React.useRef(searchValue)
  const {setAddresses} = useSelectedAddresses()
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
          disabled={!inputIsValid || searchValue === (lastValueRef.current || '')}
          onClick={() => {
            const validAddresses = getValidAddresses(searchValue)

            setAddresses(validAddresses)
            lastValueRef.current = searchValue

            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.set('addresses', searchValue.split(',').slice(0, maxAddresses).join(','))
            const newUrl = `${pathname}?${newSearchParams.toString()}`

            if (pushOnChange) {
              const newSearchParams = new URLSearchParams(searchParams)
              newSearchParams.set('addresses', searchValue.split(',').slice(0, maxAddresses).join(','))
              router.push(newUrl)
            } else {
              window.history.pushState(null, '', newUrl)
            }
          }}
        >
          Search
        </Button>
      </div>
      <p className={'text-[color:--secondary] text-xs mt-2'}>
        {inputHelperText}
      </p>
    </div>
  )
}
