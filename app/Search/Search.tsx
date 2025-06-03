'use client'

import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import useDebounce from '@/app/hooks/useDebounce'
import SearchContent from '@/app/Search/SearchContent'
import { usePathname } from 'next/navigation'

const searchInputId = 'search-input'

interface SearchInputProps {
  showIcon?: boolean
  zIndex?: number
  pathToHide?: string
  height?: string | number
}

export default function SearchInput({ showIcon = true, zIndex = 1024, pathToHide, height = 34 }: SearchInputProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [show, setShow] = useState(false)
  const [inputWidth, setInputWidth] = useState(0)
  const wasInputClickedRef = useRef(false)

  const pathname = usePathname()
  // this is required because usePathname doesn't cause a rerender when the pathname changes
  const [isVisible, setIsVisible] = useState(pathToHide ? pathToHide !== pathname : true)
  useEffect(() => {
    if (!pathToHide) return
    setIsVisible(pathname !== pathToHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    setShow(!!debouncedSearch)

    const abortController = new AbortController()

    document.addEventListener('click', (event) => {
      wasInputClickedRef.current = (event?.target as HTMLInputElement)?.id === searchInputId
    }, { signal: abortController.signal })

    return () => {
      abortController.abort()
    }
  }, [debouncedSearch])

  if (!isVisible) {
    return null
  }
  return (
    <Popover
      open={show}
      onOpenChange={(open) => {
        setTimeout(() => {
          if (wasInputClickedRef.current) {
            wasInputClickedRef.current = false
            return
          }

          setShow(open)
        }, 150)
      }}
    >
      <PopoverAnchor
        ref={(input) => {
          if (input) {
            setInputWidth(input.offsetWidth)
          }
        }}
        style={{ zIndex: zIndex + 1 }}
        className={"flex my-1 w-full flex-row items-center gap-2 border px-2 border-[color:--divider] rounded-md relative bg-[color:--main-background]"}
      >
        {showIcon && (
          <Search className={'h-5 w-5 text-[color:--secondary]'} />
        )}
        <Input
          value={search}
          id={searchInputId}
          type={'search'}
          autoComplete={'off'}
          autoFocus={false}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          onFocus={() => {
            if (debouncedSearch) {
              setShow(true)
            }
          }}
          style={{
            height,
            minHeight: height,
            maxHeight: height,
          }}
          className={"grow md:w-[480px] border-none p-0 placeholder:text-[color:--secondary] text-xs md:text-sm"}
          placeholder={"Search by Address / Txn Hash / Block / Service"}
        />
      </PopoverAnchor>
      <PopoverContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        style={{
          width: inputWidth,
          minWidth: inputWidth,
          maxWidth: inputWidth,
          zIndex
      }}
        className={'p-0 relative border-t-0 w-auto border-[color:--divider] rounded-t-none bg-[color:--background]'}
        sideOffset={-4}
      >
        <Suspense
          fallback={(
            <div className={"flex h-[112px] items-center justify-center p-4"}>
              <Loader2 className={"w-12 h-12 animate-spin stroke-[color:--primary]"}/>
            </div>
          )}
          key={debouncedSearch}
        >
          <SearchContent
            value={debouncedSearch}
            close={() => {
              setSearch('')
              setShow(false)
            }}
          />
        </Suspense>
      </PopoverContent>
    </Popover>

  )
}
