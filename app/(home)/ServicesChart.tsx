'use client'

import React from 'react'
import { AugmentedItem } from '@/app/(home)/ServicesCard'
import ServicesGainers from '@/app/(home)/ServicesGainers'
import BaseDoughnut from '@/app/Charts/BaseDoughnut'

export default function ServicesDoughnutChart({data, includeGainers = true}: {data: AugmentedItem[], includeGainers?: boolean}) {
  return (
   <div className={'flex flex-col gap-6 sm:gap-0 sm:h-[600px] w-full items-center justify-center px-4 xl:px-10'}>
     <BaseDoughnut
       data={
        data.map((item) => ({
          id: item.id,
          total: item.sum.computedUnits,
          percent: item.percentages.computedUnits,
        }))
       }
     />
     {includeGainers && (
       <ServicesGainers data={data} />
     )}
   </div>
 )
}
