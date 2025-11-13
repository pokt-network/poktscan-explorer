'use client'

import BaseDetail from '@/app/components/BaseDetail'
import React from 'react'
import getApp from '@/app/(details)/app/[id]/getApp'
import getRows from '@/app/(details)/app/[id]/rows'

interface AppDetailProps {
  id: string
  rpcUrl: string
}

export default function AppDetail({
  id,
  rpcUrl,
}: AppDetailProps) {
  return (
    <BaseDetail
      id={id}
      rpcUrl={rpcUrl}
      fetchFunction={getApp}
      getRows={getRows}
      entity={'app'}
      pollInterval={30 * 1000}
    />
  )
}
