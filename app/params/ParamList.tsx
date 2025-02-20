'use client'

import { paramsDocument } from '@/app/params/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import EntityLink from '@/app/components/EntityLink'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { CircleAlert, Search } from 'lucide-react'
import useDebounce from '@/app/hooks/useDebounce'

interface ParamListProps {
  initialData: DocumentNodeData<typeof paramsDocument>
}

export default function ParamList({initialData}: ParamListProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search.trim().toLowerCase(), 300)

  const data = useFetchOnBlock({
    query: paramsDocument,
    initialResult: initialData
  })

  const paramsToRender: Record<string,Array<{key: string, value: string, block: {height: string}}>> = {}

  for (const {key, namespace, block, value} of Object.values(data.params.nodes)) {
    const include = !debouncedSearch || namespace.toLowerCase().includes(debouncedSearch)

    if (include || key.toLowerCase().includes(debouncedSearch)) {
      if (!paramsToRender[namespace]) {
        paramsToRender[namespace] = []
      }
      paramsToRender[namespace].push({
        key,
        value,
        block
      })
    }
  }

  return (
    <>
      <div className={'flex flex-row items-center gap-3 justify-between pr-2 flex-wrap'}>
        <h1 className={'text-lg font-medium'}>
          Parameters
        </h1>
        <div className={'flex flex-row items-center w-full md:w-[400px] border-b border-[color:--divider] pl-2'}>
          <Search className={'w-5 h-5 text-[color:--secondary]'} />
          <Input
            value={search}
            type={'search'}
            placeholder={'Search'}
            onChange={(e) => setSearch(e.target.value)}
            className={'border-b border-[color:--divider] border-0 rounded-none placeholder:text-[color:--secondary]'}
          />

        </div>
      </div>
      {Object.keys(paramsToRender).length ? Object.entries(paramsToRender).map(([paramName, params]) => (
        <div
          key={paramName}
          className={'bg-[color:--main-background] p-5 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow'}
        >
          <h2 className={'text-sm font-medium'}>
            {paramName.at(0).toUpperCase() + paramName.substring(1)} Parameters
          </h2>
          <div className={'grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4'}>
            {params.filter(item => item.value).map(item => {
              let value = item.value

              try {
                const parsedValue = JSON.parse(item.value)

                if (typeof parsedValue === 'object') {
                  value = JSON.stringify(parsedValue, null, 6)
                }
              } catch {
              }

              return (
                <div key={item.key}
                     className={'flex flex-col justify-between gap-2 bg-[color:--background] p-4 rounded-lg border border-[color:--divider] flex flex-col gap-2'}>
                  <div className={'flex flex-col gap-2'}>
                    <p
                      className={'text-xs font-semibold text-[color:--secondary] whitespace-nowrap overflow-hidden overflow-ellipsis'}>
                      {item.key}
                    </p>
                    <p className={'text-xs text-[color:--foreground] whitespace-pre break-all'}>
                      {value}
                    </p>
                  </div>
                  {
                    item.block.height !== '1' && (
                      <div className={'flex flex-row gap-2 items-center text-[10px]'}>
                        <EntityLink
                          entity={'block'}
                          entityId={item.block.height}
                          label={`Updated at block ${item.block.height}`}
                          copy={{ enabled: false }}
                        />
                      </div>
                    )
                  }
                </div>
              )
            })}
          </div>
        </div>
      )) : (
        <div className={'flex flex-col grow h-[calc(100dvh-311px)] pb-10 md:h-[calc(100dvh-271px)] items-center justify-center gap-1'}>
          <CircleAlert className={'w-10 h-10 mb-1 text-[color:--secondary]'} />
          <p>
            No parameters found
         </p>
          <p className={'text-sm text-[color:--secondary]'}>
            Try another search
          </p>
        </div>
      )}
    </>
  )
}
