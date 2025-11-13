'use client'

import React from 'react'
import getRows from '@/app/(details)/service/[id]/rows'
import GetService from '@/app/(details)/service/[id]/getService'
import BaseDetail from '@/app/components/BaseDetail'

interface ServiceDetailProps {
  id: string
  rpcUrl: string
}

export default function ServiceDetail({id, rpcUrl}: ServiceDetailProps) {
  return (
    <BaseDetail
      id={id}
      rpcUrl={rpcUrl}
      fetchFunction={GetService}
      getRows={getRows}
      showNotFoundForMissingData={true}
      entity={'service'}
   />
  )
}
