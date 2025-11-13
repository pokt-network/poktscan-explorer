'use client'

import React from 'react'
import getRows from '@/app/(details)/supplier/[id]/rows'
import getSupplier from '@/app/(details)/supplier/[id]/getSupplier'
import BaseDetail from '@/app/components/BaseDetail'

interface SupplierDetailProps {
  id: string,
  rpcUrl: string
}

export default function SupplierDetail({id, rpcUrl}: SupplierDetailProps) {
  return (
    <BaseDetail
      id={id}
      rpcUrl={rpcUrl}
      fetchFunction={getSupplier}
      showNotFoundForMissingData={true}
      entity={'supplier'}
      getRows={getRows}
      pollInterval={30 * 1000}
    />
  )
}
