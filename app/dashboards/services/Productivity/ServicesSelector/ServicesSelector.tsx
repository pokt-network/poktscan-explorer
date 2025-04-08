'use client'

import SearchInput from '@/app/dashboards/services/Productivity/ServicesSelector/SearchInput'
import { useState } from 'react'
import { hashStringToColor } from '@/app/Charts/utils'
import { clsx } from 'clsx'
import { Check } from 'lucide-react'
import { formatSimpleAmount } from '@/app/utils/format'
import { Button } from '@/components/ui/button'

interface DataItem {
  id: string
  label: string
  value: number
  color?: string
}

function getLabel({id, label}: DataItem) {
  return label ? `${label} (${id})` : id
}

interface ServiceItemProps {
  item: DataItem
  isSelected: boolean
  onClick: () => void
}

function ServiceItem({item, isSelected, onClick}: ServiceItemProps) {
  const color = item.color || hashStringToColor(item.id)

  return (
    <Button
      onClick={onClick}
      variant={'ghost'}
      className={'p-0 flex flex-row items-center gap-3 h-4 pr-1'}
    >
      <div
        className={
          clsx(
            'min-w-4 min-h-4 w-4 h-4',
            isSelected && 'flex items-center justify-center',
            !isSelected && 'border-[3px] border-[color:--divider]',
          )
        }
        style={{
          backgroundColor: isSelected ? color : undefined
        }}
      >
        {isSelected && <Check className={'stroke-[3px] text-white w-3 h-3'} />}
      </div>
      <p className={'text-xs h-4 leading-4 min-h-4 text-left text-ellipsis font-medium overflow-hidden whitespace-nowrap tracking-wide w-full'}>
        {getLabel(item)}
      </p>
      <p className={'text-xs font-bold text-right'}>
        {formatSimpleAmount(item.value)}
      </p>
    </Button>
  )
}

interface TopChipProps {
  top: number
  data: Array<DataItem>
  selectedServices: Array<string>
  changeSelectedServices: (services: Array<string>) => void
}

function TopChip({
  top,
  data,
  selectedServices,
  changeSelectedServices,
}: TopChipProps) {
  if (data.length < top) return null

  const areAllSelected = data.slice(0, top).every(item => selectedServices.includes(item.id)) && selectedServices.length === top

  return (
    <Button
      variant={'ghost'}
      onClick={() => {
        if (areAllSelected) return

        changeSelectedServices(
          data.slice(0, top).map(item => item.id)
        )
      }}
      className={
        clsx(
          'h-5 min-h-5 max-h-5 text-[11px] leading-5 font-medium rounded-2xl w-12 p-0 gap-0',
          areAllSelected && 'bg-[color:--primary-background] hover:bg-[color:--primary-background] text-white'
        )
      }
    >
      <p>
        Top {top}
      </p>
    </Button>
  )
}

interface ServicesSelectorProps {
  servicesSelected: Array<string>
  changeSelectedServices: (services: Array<string>) => void
  data: Array<DataItem>
}

export default function ServicesSelector({
  servicesSelected,
  changeSelectedServices,
  data,
}: ServicesSelectorProps) {
  const [searchInput, setSearchInput] = useState('')

  const changeSearchInput = (searchInput: string) => {
    setSearchInput(searchInput)
  }

  const filteredData = data.filter((item) => {
    if (!searchInput) return true

    return getLabel(item).toLowerCase().includes(searchInput.toLowerCase())
  })

  const showChips = data.length >= 3

  return (
    <div className={'border border-[color:--divider] p-4 h-full w-full bg-[color:--main-background]'}>
      <SearchInput
        searchInput={searchInput}
        changeSearchInput={changeSearchInput}
      />
      {showChips && (
        <div className={'flex flex-row gap-2 items-center mt-2 h-5'}>
          {[3, 5, 10, 15].map((top) => (
            <TopChip
              key={top}
              top={top}
              selectedServices={servicesSelected}
              changeSelectedServices={changeSelectedServices}
              data={data}
            />
          ))}
        </div>
      )}
      <div
        className={'overflow-y-auto grow min-h-0 flex flex-col gap-3 mt-4'}
        style={{
          height: `calc(100% - 50px ${showChips ? '- 24px' : ''})`
        }}
      >
        {filteredData.map((item) => {
          const isSelected = servicesSelected.includes(item.id)
          return (
            <ServiceItem
              key={item.id}
              item={item}
              isSelected={isSelected}
              onClick={() => {
                if (isSelected) {
                  changeSelectedServices(servicesSelected.filter(id => id !== item.id))
                } else {
                  changeSelectedServices([...servicesSelected, item.id])
                }
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
