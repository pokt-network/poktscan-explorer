'use client'

import { supplierByIdDocument } from '@/app/(details)/supplier/[id]/operations'
import React from 'react'
import getRows from '@/app/(details)/supplier/[id]/rows'
import getSupplier, { GetSupplierResult, parseSupplierFromIndexer } from '@/app/(details)/supplier/[id]/getSupplier'
import BaseDetail from '@/app/components/BaseDetail'

interface SupplierDetailProps extends GetSupplierResult {
  id: string,
  rpcUrl: string
}

export default function SupplierDetail({id, source, data: initialData, error, height, rpcUrl}: SupplierDetailProps) {
  return (
    <BaseDetail
      id={id}
      source={source}
      rpcUrl={rpcUrl}
      initialData={initialData}
      graphqlDocument={supplierByIdDocument}
      fetchFunction={getSupplier}
      getRows={getRows}
      SelfComponent={SupplierDetail}
      resultParser={parseSupplierFromIndexer}
      height={height}
      error={error}
      showNotFoundForMissingData={true}
    />
  )
}
