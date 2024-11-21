'use client'

import React, { MutableRefObject, useEffect, useRef } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { AugmentedItem } from '@/app/(home)/ServicesCard'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend, TooltipItem,
} from 'chart.js'
import { useTheme } from 'next-themes'
import ServicesGainers from '@/app/(home)/ServicesGainers'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

type ChartItem = {
  id: string
  relays: number
  computedUnits: number
  network: number
}

function getThicknessOptions(data: Array<ChartItem>) {
  let innerRadius = 80,
    outerRadius = 118

  const thicknessValues = data.map(() => {
    const value = [innerRadius, outerRadius]
    innerRadius += 3
    outerRadius -= 3
    return value
  })
  const thickness = thicknessValues.map((value) => ({
    inner: value[0],
    outer: value[1],
  }))
  return {
    id: 'thickness',
    beforeDraw: function (chart: ChartJS<'doughnut', unknown, unknown>) {
      chart.getDatasetMeta(0).data.forEach((dataItem, index) => {
        const { inner, outer } = thickness[index]
        // eslint-disable-next-line
        // @ts-ignore
        dataItem.innerRadius = inner
        // eslint-disable-next-line
        // @ts-ignore
        dataItem.outerRadius = outer
      })
    },
  }
}

const chartColors = [
  '#4F46E5',
  '#06B6D4',
  '#F97316',
  '#10B981',
  '#8B5CF6',
  '#8f8f8f'
] as const

function Chart({data, ref}: {data: Array<ChartItem>, ref: MutableRefObject<ChartJS<'doughnut', unknown, unknown>>}) {
  const {theme = 'dark'} = useTheme();
  const isDark = theme === 'dark'

  return (
    <Doughnut
      ref={ref}
      style={{
        minHeight: '100%',
        maxHeight: '100%',
        minWidth: '100%',
        maxWidth: '100%',
      }}
      data={{
        labels: [],
        datasets: [
          {
            data,
            backgroundColor: chartColors,
            borderColor: chartColors,
            hoverBackgroundColor: chartColors,
            borderWidth: 0,
          },
        ],
      }}
      width={'100%'}
      height={'100%'}
      plugins={[getThicknessOptions(data)]}
      options={{
        parsing: {
          key: 'network',
        },
        layout: {
          padding: { right: 12 },
        },
        rotation: -50,
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: {
          tooltip: {
            backgroundColor: isDark ? 'rgb(61,61,61)' : 'rgb(89,89,89)',
            mode: 'nearest',
            intersect: false,
            displayColors: false,
            bodyFont: {
              weight: 'bold'
            },
            callbacks: {
              label(tooltipItem: TooltipItem<'doughnut'>): string | string[] | void {
                return (tooltipItem?.raw as ChartItem)?.computedUnits?.toLocaleString() || '0'
              }
            }
          },
          legend: {
            display: false,
          },
        },
      }}
    />

  )
}

export default function ServicesDoughnutChart({data}: {data: AugmentedItem[]}) {
  const sortedData = data.sort((a, b) => b.sum.computedUnits - a.sum.computedUnits)
  const chartRef = useRef<ChartJS<'doughnut', unknown, unknown>>()

  const topChains = 5

  const chainsToShow: Array<ChartItem> = sortedData.slice(0, topChains).map(service => ({
    id: service.id,
    relays: service.sum.relays,
    computedUnits: service.sum.computedUnits,
    network: service.percentages.computedUnits,
  }))

  const {relays, computedUnits, network} = sortedData.slice(topChains).reduce((acc, item) => {
    acc.relays += item.sum.relays
    acc.computedUnits += item.sum.computedUnits
    acc.network += item.percentages.computedUnits
    return acc
  }, {relays: 0, computedUnits: 0, network: 0})

  if (relays !== 0) {
    chainsToShow.push({
      id: 'Others',
      relays,
      computedUnits,
      network,
    })
  }

  useEffect(() => {
    const abortController = new AbortController()

    window.addEventListener('click', (event) => {
      if (!document.getElementById('legends-container')?.contains(event.target as Node)) {
        const chart = chartRef.current
        if (chart) {
          const tooltip = chart.tooltip
          tooltip!.setActiveElements([], { x: 0, y: 0 })
          chart.update()
        }
      }
    })

    return () => {
      abortController.abort()
    }
  }, [])

 return (
   <div className={'flex flex-col gap-6 sm:gap-0 sm:h-[600px] w-full items-center justify-center px-4 xl:px-10'}>
     <div className={'flex flex-col sm:flex-row w-full items-center justify-center'}>
       <div
         className={`relative h-[260px] lg:h-auto w-full sm:w-[300px] lg:w-[60%] xl:w-[50%] justify-center items-center flex after:absolute after:content-['Computed_Units'] after:flex after:items-center after:justify-center after:w-[100px] after:pr-2 after:font-bold after:text-center`}
       >

         <Chart data={chainsToShow} ref={chartRef as any} />
       </div>
       <div id={'legends-container'} className={'flex flex-col grow gap-3 max-w-[220px] lg:max-w-[150px] w-full sm:max-w-[220px] lg:w-[40%] xl:w-[50%]'}>
         {chainsToShow.map((item, index) => {
           const chainColor = chartColors[index]

           return (
             <div
               key={item.id}
               className={'flex flex-row items-center gap-2 cursor-pointer'}
               onClick={() => {
                 if (chartRef.current) {
                   const chart = chartRef.current!

                   const tooltip = chart.tooltip!
                   const activeElements = tooltip.getActiveElements()
                   const isActive = activeElements.some((el) => el.index === index)

                   if (isActive) {

                   } else {
                     const chartArea = chart.chartArea
                     tooltip.setActiveElements(
                       [
                         {
                           datasetIndex: 0,
                           index: index,
                         },
                       ],
                       {
                         x: (chartArea.left + chartArea.right) / 2,
                         y: (chartArea.top + chartArea.bottom) / 2,
                       }
                     )
                     chart.update()

                   }
                 }
               }}
             >
               <div
                 className={`flex items-center justify-between py-1 rounded-sm`}
                 style={{
                   backgroundColor: chainColor
                 }}
               >
                 <p className={'text-white text-xs font-bold text-center w-[50px]'}>
                   {Number(item.network.toFixed(1))}%</p>
               </div>
               <p className={'text-sm font-bold whitespace-nowrap overflow-hidden overflow-ellipsis'}>
                 {item.id}
               </p>
             </div>
           )
         })}
       </div>
     </div>
     <ServicesGainers data={data} />
   </div>

 )
}
