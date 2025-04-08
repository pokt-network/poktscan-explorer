'use client'

import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  searchInput: string
  changeSearchInput: (searchInput: string) => void
}

export default function SearchInput({
  searchInput,
  changeSearchInput,
}: SearchInputProps) {
  return (
    <div className={'h-[30px] flex flex-row items-center gap-1 border border-[color:--divider] bg-[color:--background] px-2'}>
      <Search className={'stroke-1 min-w-4 w-4 h-4 text-[color:--secondary]'} />
      <Input
        id={'search-input'}
        value={searchInput}
        onChange={(e) => changeSearchInput(e.target.value)}
        placeholder={'Search...'}
        className={'border-none h-[28px] pl-1 pr-0 text-[color:--secondary] bg-[color:--background] outline-[color:--background] placeholder:tracking-wider placeholder:text-xs text-xs overflow-visible'}
      />
      {searchInput && (
        <Button
          variant={'ghost'}
          onClick={() => changeSearchInput('')}
          className={'px-0'}
        >
          <X className={'stroke-2 min-w-4 w-4 h-4 text-[color:--secondary]'} />
        </Button>
      )}
    </div>
  )
}
