'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { useDateContext } from '@/app/dates/Context'
import { dateTimeColumnField, dateTimeZoneField, formatTextField } from '@/app/dates/constants'
import { Check } from 'lucide-react'

interface DateSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DateSettingsDialog({open, onOpenChange}: DateSettingsProps) {
  const {changeValues, dateTimeColumn, dateTimeZone, formatText} = useDateContext()
  const [formatInput, setFormat] = React.useState(formatText)
  const [submitted, setSubmitted] = useState(false)
  const utcOffset = (new Date().getTimezoneOffset() / 60) * -1

  useEffect(() => {
    setFormat(formatText)
  }, [formatText])

  let formattedDateText: string, invalidFormat = false

  try {
    formattedDateText = `This is how the date times are going to look: ${format(new Date(), formatInput)}`
  } catch {
    invalidFormat = true
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
    const formData = new FormData(e.currentTarget);

    // Extract values from the form
    const dateTimeColumnValue = formData.get(dateTimeColumnField) as string;
    const dateTimeZoneValue = formData.get(dateTimeZoneField) as string;
    const formatTextValue = formData.get(formatTextField) as string;

    changeValues({
      dateTimeColumn: dateTimeColumnValue,
      dateTimeZone: dateTimeZoneValue,
      formatText: formatTextValue,
    })

    setTimeout(() => {
      setSubmitted(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[100dvh] p-0 sm:h-auto z-[2000] max-w-[100dvw] sm:max-w-[620px] bg-[color:--main-background] border-[color:--divider] rounded-none sm:rounded-lg border-none sm:border-[1px!important]">
        <form
          onSubmit={onSubmit}
          className={'flex flex-col gap-4'}
        >
          <DialogHeader className={'border-b h-[86px] border-[color:--divider] px-4 py-5'}>
            <DialogTitle>Date Settings</DialogTitle>
            <DialogDescription>
              Set how do you want to see dates in this site.
            </DialogDescription>
          </DialogHeader>
          <div className={'px-4 h-[calc(100dvh-78px-86px-32px)] sm:h-auto'}>
            <div>
              <p className={'text-sm font-medium'}>Date Time Columns</p>
              <div
                className={'flex flex-col sm:flex-row  sm:items-center  sm:justify-between gap-2 sm:gap-5 w-full mt-2 sm:mt-0'}
              >
                <Label className={'text-xs sm:text-sm font-normal'} htmlFor={dateTimeColumnField}>
                  Select whether to display the age or the date time in the tables
                </Label>
                <Select defaultValue={dateTimeColumn} name={dateTimeColumnField}>
                  <SelectTrigger className={"min-w-[120px] sm:w-[120px] text-xs"}>
                    <SelectValue placeholder={"Items"} />
                  </SelectTrigger>
                  <SelectContent className={'z-[2001]'}>
                    <SelectItem value={'age'}>
                      Age
                    </SelectItem>
                    <SelectItem value={'date-time'}>
                      Date Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className={'mt-4'}>
              <p className={'text-sm font-medium'}>Date Time Format</p>
              <div
                className={'flex flex-col sm:flex-row  sm:items-center  sm:justify-between gap-2 sm:gap-5 w-full mt-2 sm:mt-0'}
              >
                <Label className={'text-xs sm:text-sm font-normal'} htmlFor={dateTimeZoneField}>
                  Select whether to display Date Time in UTC or local (UTC{utcOffset}) time zone
                </Label>
                <Select defaultValue={dateTimeZone} name={dateTimeZoneField}>
                  <SelectTrigger className={'min-w-[120px] sm:w-[120px] text-xs'}>
                    <SelectValue placeholder={'Items'} />
                  </SelectTrigger>
                  <SelectContent className={'z-[2001]'}>
                    <SelectItem value={'utc'}>
                      UTC
                    </SelectItem>
                    <SelectItem value={'local'}>
                      Local (UTC{utcOffset})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div
                className={'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-5 w-full mt-4'}>
                <Label className={'text-xs sm:text-sm font-normal'} htmlFor={formatTextField}>
                  Type the format of the date times
                </Label>
                <Input
                  name={formatTextField}
                  className={'border-[color:--divider] sm:max-w-[200px] text-xs sm:text-sm'}
                  value={formatInput}
                  onChange={(e) => {
                    setFormat(e.target.value)
                  }}
                />
              </div>
              <p
                className={`text-[10px] mt-1.5 sm:mt-0 ${invalidFormat ? 'text-[color:--error]' : 'text-[color:--secondary]'}`}>
                {invalidFormat ? 'Invalid format, please type another one' : formattedDateText}
              </p>
            </div>
          </div>
          <DialogFooter
            className={'border-t border-[color:--divider] px-4 py-5 bg-[color:--background] sm:rounded-b-lg h-[78px]'}>
            <Button
              type="submit"
              className={`min-w-[130px] ${submitted ? 'bg-[color:--success] hover:bg-[color:--success] disabled:opacity-[1!important]' : 'bg-[color:--primary-background] hover:bg-[color:--primary]'}`}
              disabled={invalidFormat}
            >
              {submitted ? (
                  <>
                    <Check className={'h-4 w-4'} />
                    <span className={'text-white'}>
              Submitted!
            </span>
                  </>
                ) :'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
