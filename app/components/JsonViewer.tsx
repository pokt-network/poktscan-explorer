'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import useMediaQuery from '@/app/hooks/useMediaQuery'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const ReactJson = dynamic(() => import('react-json-view'), {
  ssr: false,
  loading: () => (
    <div
      className={'flex grow items-center bg-[color:--background] p-2'}
      style={{
        minHeight: 70,
        justifyContent: 'center'
      }}
    >
      <Loader2 className={"w-12 h-12 animate-spin stroke-[color:--primary]"}/>
    </div>
  )
})

export default function JsonViewer({json}:{ json: object }) {
  const {theme} = useTheme()
  const isLight = theme === 'light'
  const isSmallScreen = useMediaQuery('(max-width: 500px)')

  return (
    <ReactJson
      src={json}
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
