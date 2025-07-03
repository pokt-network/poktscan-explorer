'use client'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useSelectedAddresses } from '@/app/tools/SelectedAddresses'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { maxAddresses } from '@/app/tools/operator/constants'
import EntityLink from '@/app/components/EntityLink'
import { clsx } from 'clsx'
import { Check, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import { uniq } from 'lodash'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

function CopyAllButton() {
  const {addresses} = useSelectedAddresses()
  const [isCopied, setIsCopied] = useState(false)

  const copyAddresses = () => {
    if (isCopied) return

    navigator.clipboard.writeText(addresses.join(',')).then(() => {
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 1500)
    })
  }

  let content: React.ReactNode

  if (isCopied) {
    content = (
      <>
        <span>
          Copied!
        </span>
        <Check className={'h-4 w-4'}/>
      </>
    )
  } else {
    content = 'Copy All'
  }

  return (
    <Button
      variant={'outline'}
      onClick={copyAddresses}
      className={'h-[30px] gap-1 border-[color:--divider] hover:text-[color:--primary] transition-colors'}
    >
      {content}
    </Button>
  )
}

enum InputStatus {
  Valid = 'valid',
  InvalidText = 'invalid-text',
  MaxAddressesReach = 'max-addresses-reach',
  AddressRepeated = 'address-repeated'
}

function InputHelperText({inputStatus} :{ inputStatus: InputStatus }) {
  let helperText: string

  switch (inputStatus) {
    case InputStatus.AddressRepeated: {
      helperText = 'There are repeated addresses.'
      break
    }
    case InputStatus.InvalidText: {
      helperText = 'Text is not valid.'
      break
    }
    case InputStatus.MaxAddressesReach: {
      helperText = `You can only add up to ${maxAddresses} addresses.`
      break
    }
    case InputStatus.Valid: {
      helperText = 'Addresses ready to be added.'
      break
    }
  }

  return (
    <p
      className={
        clsx(
          'text-xs tracking-wide font-medium -mt-2',
          inputStatus === InputStatus.Valid && 'text-[color:--success]',
          inputStatus !== InputStatus.Valid && 'text-[color:--error]',
        )
      }
    >
      {helperText}
    </p>
  )
}

function getAddressesFromText(text: string): Array<string> {
  return uniq(text.trim()
    .split(/[\n,\s]+/)
    .map((line) => line.trim())
    .filter(isValidPoktAddress))
}

function getInputStatus(addressesSelected: Array<string>, inputValue: string): InputStatus {
  const input = inputValue.trim()
  if (!input) {
    return InputStatus.InvalidText
  }

  // Split by newlines, commas, or spaces and filter out empty strings
  const lines = getAddressesFromText(input)

  if (lines.length === 0) {
    return InputStatus.InvalidText
  }

  if (lines.length + addressesSelected.length > maxAddresses) {
    return InputStatus.MaxAddressesReach
  }

  if (addressesSelected.some((address) => lines.includes(address))) {
    return InputStatus.AddressRepeated
  }

  return InputStatus.Valid
}

interface ManageAddressesProps {
  pushOnChange?: boolean
}

export default function ManageAddresses({pushOnChange}: ManageAddressesProps) {
  const [showModal, setShowModal] = useState(false)
  const [addressesInput, setAddressesInput] = useState('')
  const {addresses, setAddresses} = useSelectedAddresses()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const inputStatus = getInputStatus(addresses, addressesInput)

  const updateUrl = (newAddresses: Array<string>)=> {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('addresses', newAddresses.join(','))
    const newUrl = `${pathname}?${newSearchParams.toString()}`

    if (pushOnChange) {
      router.push(newUrl, {
        scroll: false
      })
    } else {
      window.history.pushState(null, '', newUrl)
    }
  }

  const handleAddAddresses = () => {
    if (inputStatus === InputStatus.Valid) {
      const newAddresses = getAddressesFromText(addressesInput)

      const allAddresses = [...addresses, ...newAddresses].slice(0, maxAddresses)

      setAddresses(allAddresses)
      setAddressesInput('')

      updateUrl(allAddresses)
    }
  }

  const removeAddress = (address: string) => {
    const newAddresses = addresses.filter((a) => a !== address)

    setAddresses(newAddresses)

    updateUrl(newAddresses)
  }

  return (
    <>

      <Dialog open={showModal} onOpenChange={(value) => {
        setShowModal(value)
        if (!value) {
          setTimeout(() => {
            setAddressesInput('')
          }, 150)
        }
      }}>
        <DialogTrigger asChild>
          <Button
            variant={'outline'}
            onClick={() => setShowModal(true)}
            className={'ml-1 h-[34px] border-[color:--divider] gap-1.5 bg-[color:--main-background] shadow-sm px-3 text-[13px] text-[color:--primary]'}
          >
            Manage Addresses <span className={'text-[color:--secondary]'}>({addresses.length}/{maxAddresses})</span>
          </Button>
        </DialogTrigger>
        <DialogContent className={'flex flex-col !w-[calc(100dvw)] max-w-full md:max-w-2xl px-4 h-[calc(100dvh)] md:h-auto !rounded-none md:!rounded-xl md:max-h-[calc(100dvh-80px)] bg-[color:--main-background] border-none md:border border-[color:--divider]'}>
          <DialogHeader className={''}>
            <DialogTitle>Manage Addresses</DialogTitle>
            <DialogDescription className={'text-xs tracking-wide font-medium'}>
              Add or paste multiple addresses (up to {maxAddresses} total)
            </DialogDescription>
          </DialogHeader>
          <div className={'relative'}>
            <Textarea
              id="addresses"
              placeholder={`Enter one or more addresses (separated by new lines, commas, or spaces):

pokt1abc123def456ghi789jkl012mno345pqr678stu
pokt1xyz789abc123def456ghi789jkl012mno345pqr
pokt1def456ghi789jkl012mno345pqr678stu901vwx`}
              value={addressesInput} rows={10}
              onChange={(e) => setAddressesInput(e.target.value)}
              className="min-h-[140px] max-h-[260px] font-mono !text-[12px] border-[color:--divider] bg-[color:--background] placeholder:text-[color:--secondary]"
            />
            <Button
              disabled={inputStatus !== InputStatus.Valid}
              onClick={handleAddAddresses}
              className={'absolute bottom-2 sm:bottom-3 px-3 sm:px-4 right-2 sm:right-3 h-[30px] sm:h-[34px] bg-[color:--main-background] hover:text-[color:--primary] border-[--divider] !text-xs sm:!text-[13px]'}
              variant={'outline'}
            >
              Add Addresses
            </Button>
          </div>
          {addressesInput && (
            <InputHelperText inputStatus={inputStatus} />
          )}
          {addresses.length > 0 && (
            <div>
              <hr className={'border-[color:--divider] my-4'} />
              <div className={'flex flex-row items-center justify-between gap-2 mb-2'}>
                <p className={'font-medium -mt-2'}>
                  Selected Addresses
                </p>

                <CopyAllButton />
              </div>

              <div
                className={'flex flex-wrap gap-2'}
              >
                {addresses.map((address) => (
                  <div
                    key={address}
                    className={
                      clsx(
                        'w-fit flex flex-row text-xs items-center bg-[color:--main-background] rounded-3xl border px-2 border-[color:--divider]',
                        '[&_button]:w-[20px] [&_button]:h-[20px] [&_button]:ml-0.5',
                        '[&_svg]:w-[12px] [&_svg]:h-[12px]',
                      )
                    }
                  >
                    <EntityLink entity={'account'} entityId={address} />
                    <Button
                      size={'icon'}
                      onClick={() => removeAddress(address)}
                      disabled={addresses.length === 1}
                      className="text-[color:--secondary] hover:text-[color:--primary] transition-colors !-ml-0"
                      title="Remove address"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
