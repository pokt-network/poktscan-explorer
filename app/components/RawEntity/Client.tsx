'use client'

import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useTheme } from 'next-themes'
import useMediaQuery from '@/app/hooks/useMediaQuery'
import { EntityLinkProps } from '@/app/components/EntityLink'
import { useHeightContext } from '@/app/context/height'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false })

function getUrl(baseUrl: string, entity: EntityLinkProps['entity'], id: string) {
  switch(entity) {
    case 'tx':
      return `${baseUrl}/cosmos/tx/v1beta1/txs/${id}`
    case 'app':
      return `${baseUrl}/pokt-network/poktroll/application/application/${id}`
    case 'supplier':
      return `${baseUrl}/pokt-network/poktroll/supplier/supplier/${id}`
    case 'gateway':
      return `${baseUrl}/pokt-network/poktroll/gateway/gateway/${id}`
    case 'block':
      return `${baseUrl}/cosmos/base/tendermint/v1beta1/blocks/${id}`
    case 'account':
      return  `${baseUrl}/cosmos/bank/v1beta1/balances/${id}`
    case 'validator':
      return `${baseUrl}/cosmos/staking/v1beta1/validators/${id}`
    case 'service':
      return `${baseUrl}/pokt-network/poktroll/service/service/${id}`
    default:
      throw new Error(`Unknown entity: ${entity}`)
  }
}


interface RawEntityClientProps {
  baseUrl: string
  entity: EntityLinkProps['entity']
  id: string
  loadOnClick?: boolean
  canChangeHeight?: boolean
}

export default function RawEntityClient({ baseUrl, entity, id, loadOnClick = false, canChangeHeight = false }: RawEntityClientProps) {
  const url = getUrl(baseUrl, entity, id)
  const {theme} = useTheme()
  const isLight = theme === 'light'
  const isSmallScreen = useMediaQuery('(max-width: 500px)')

  const {currentHeight} = useHeightContext()
  const [heightValue, setHeightValue] = React.useState(currentHeight.toString())
  const prevHeightRef = React.useRef(currentHeight.toString())

  const [{ data, error, isLoading }, setState] = React.useState<{
    data: object | null
    error: boolean
    isLoading: boolean
  }>({
    data: null,
    error: false,
    isLoading: !loadOnClick,
  })
  const abortRef = React.useRef<AbortController | null>(null)

  const loadData = async () => {
    if (data && prevHeightRef.current === heightValue && heightValue === currentHeight.toString()) {
      return
    }

    try {
      abortRef.current = new AbortController()
      setState(prev => ({ ...prev, error: false, isLoading: true }))

      const fetchUrl = heightValue !== currentHeight.toString() ? `${url}?height=${heightValue}` : url

      const json = await fetch(fetchUrl, {
        ...(abortRef.current && {
          signal: abortRef.current!.signal,
        })
      }).then(res => res.json())

      prevHeightRef.current = heightValue
      setState({ error: false, data: json, isLoading: false })
    } catch {
      abortRef.current = null
      setState({ error: true, data: null, isLoading: false })
    }
  }

  React.useEffect(() => {
    if (loadOnClick) return

    loadData()
    // eslint-disable-next-line
  }, [url, loadOnClick])

  React.useEffect(() => {
    if (heightValue === currentHeight.toString()) return
    console.log('should change height')

    setHeightValue(heightValue)
    // to wait for setHeightValue
    setTimeout(() => {
      loadData()
    }, 0)
    // eslint-disable-next-line
  }, [currentHeight])

  let content: React.ReactNode

  if (isLoading && !data) {
    content = (
      <Loader2 className={"w-12 h-12 animate-spin stroke-[color:--primary]"}/>
    )
  } else if (error) {
    content = (
      <p className={'text-sm text-[color:--error]'}>
        There is a problem loading data...
        <Button variant={'ghost'} onClick={loadData} className={'text-sm px-2'}>
          Click here to load data...
        </Button>

      </p>
    )
  } else if (loadOnClick && !data) {
    content = (
      <Button variant={'ghost'} onClick={loadData}>
        Click here to load data...
      </Button>
    )
  } else {
    content = (
      <ReactJson
        src={data}
        indentWidth={2}
        collapsed={false}
        style={{
          fontSize: isSmallScreen ? '10px' : '12px',
          fontFamily: 'monospace',
          backgroundColor: 'transparent',
          padding: '0px',
          margin: '0px',
          width: '100%',
          overflow: isSmallScreen ? 'auto' : undefined,
          whiteSpace:  isSmallScreen ? undefined : 'normal',
          wordBreak: isSmallScreen ? undefined : 'break-all',
        }}
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={true}
        name={false}
        onAdd={false}
        onDelete={false}
        onEdit={false}
        shouldCollapse={(field) => {
          return field.type === 'array' && (field?.src as unknown[])?.length > 1
        }}
        collapseStringsAfterLength={64}
        theme={{
          base00: '',
          base01: '',
          base02: isLight ? '#DFDFDF' : '#272727',
          base03: '',
          base04: '',
          base05: isLight ? '#FA4778' : '#4F9DE4',
          base06: '',
          base07: isLight ? '#111111' : '#FFFFFF',
          base08: '',
          base09: isLight
            ? '#0f854b'
            : '#29b973',
          base0A: '#FA4778',
          base0B: isLight
            ? '#3783C8'
            : '#4F9DE4',
          base0C: '#FA4778',
          base0D: isLight
            ? '#3783C8'
            : '#4F9DE4',
          base0E: '',
          base0F: isLight
            ? '#3783C8'
            : '#4F9DE4',
        }}
      />
    )
  }

  const minHeight = data ? undefined : 80
  const justifyContent = data || (loadOnClick && !isLoading && !error) ? 'flex-start' : 'center'

  return (
    <div
      className={'bg-[color:--main-background] p-4 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow'}
    >
      {canChangeHeight && (
        <div className={'flex flex-row gap-2 items-center'}>
          <p className={'text-sm'}>Height:</p>
          <Input
            value={heightValue}
            className={'border-[color:--divider] bg-[color:--background] w-[100px] h-[30px]'}
            type='number'
            min={0}
            onChange={(e) => {
              let newValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
              if (newValue !== "" && Number(newValue) < 1) newValue = "1"; // Ensure minimum 1
              setHeightValue(newValue);
            }}
            onKeyDown={(e) => {
              if (
                ["e", "E", ".", "-", "+", ','].includes(e.key) || // Block invalid characters
                (e.key === "0" && e.currentTarget.value === "") // Prevent leading zero
              ) {
                e.preventDefault();
              }
            }}
          />
          <Button variant={'ghost'} className={'bg-[color:--]'} onClick={loadData}>
            {isLoading ? (
              <Loader2 size={20} className={'animate-spin'} />
            ) : (
              <>
                <Search />
                <span>Search</span>
              </>
            )}
          </Button>
        </div>
      )}
      <div
        className={'flex grow items-center bg-[color:--background] p-2'}
        style={{
          minHeight,
          justifyContent
        }}
      >
        {content}
      </div>
    </div>
  )
}
