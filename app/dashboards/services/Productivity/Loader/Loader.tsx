'use client'
import ProductivityLoaderChart from '@/app/dashboards/services/Productivity/Loader/Chart'
import ServicesSelectorLoader from '@/app/dashboards/services/Productivity/Loader/Selector'
import ProductivityCard from '@/app/dashboards/services/Productivity/Card'
import React, { Suspense } from 'react'

interface LoaderProps {
  chartType: 'line' | 'bar'
  timeSelected: string
}

export function ContentLoader({chartType}: {chartType: 'line' | 'bar'}) {
  return (
    <>
      <div className={'order-2 md:order-1 w-full md:w-[calc(100%-260px-16px)] h-full'}>
        <ProductivityLoaderChart chartType={chartType} />
      </div>

      <div className={'h-[260px] md:h-[calc(100%-16px)] w-full md:min-w-[260px] md:w-[260px] order-1 md:order-2'}>
        <ServicesSelectorLoader />
      </div>
    </>
  )
}

function Loader({
  chartType,
  timeSelected
}: LoaderProps) {
  return (
    <ProductivityCard
      timeSelected={timeSelected}
    >
      <div className={'flex flex-col md:flex-row items-center px-4 pt-2 pb-4 h-[calc(100%-44px)] gap-4'}>
        <ContentLoader chartType={chartType} />
      </div>
    </ProductivityCard>
  )
}

interface ServicesProductivityLoaderProps extends LoaderProps {
  children: React.ReactNode
}

export default function ServicesProductivityLoader({chartType, timeSelected, children}: ServicesProductivityLoaderProps) {
  return (
    <Suspense
      key={timeSelected}
      fallback={
        <Loader
          chartType={chartType}
          timeSelected={timeSelected}
        />
      }
    >
      {children}
    </Suspense>
  )
}
