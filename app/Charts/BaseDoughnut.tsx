'use client'

import React, { MutableRefObject, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { Doughnut } from 'react-chartjs-2'
import type {
  Chart as ChartJS,
  TooltipItem,
} from 'chart.js'
import Big from 'big.js'
import { formatSimpleAmount } from '@/app/utils/format'
import { hashStringToColor } from '@/app/Charts/utils'

export interface ChartItem {
  id: string
  percent: number
  total: number | string
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

export function Chart({data, ref}: {
  data: Array<ChartItem>,
  ref: MutableRefObject<ChartJS<'doughnut', unknown, unknown>>}
) {
  const {theme = 'dark'} = useTheme();
  const isDark = theme === 'dark'

  const chartColors = data.map(item => hashStringToColor(item.id))

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
          key: 'percent',
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
                return formatSimpleAmount((tooltipItem?.raw as ChartItem)?.total?.toLocaleString() || '0')
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

interface BaseDoughnutProps {
  data: Array<ChartItem>
  topItems?: number
}

export default function BaseDoughnut({
  data,
  topItems = 5,
}: BaseDoughnutProps) {
  const sortedData = data.sort((a, b) => b.percent - a.percent)
  const chartRef = useRef<ChartJS<'doughnut', unknown, unknown>>()

  const itemsToShow: Array<ChartItem> = sortedData.slice(0, topItems).map(item => ({
    id: item.id,
    total: item.total,
    percent: item.percent,
  }))

  const {total, percent} = sortedData.slice(topItems).reduce((acc, item) => {
    acc.total = new Big(acc.total).add(item.total).toString()
    acc.percent += item.percent
    return acc
  }, {total: '0', percent: 0})

  if (total !== '0') {
    itemsToShow.push({
      id: 'Others',
      total,
      percent,
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
    <div className={'flex flex-col sm:flex-row w-full items-center justify-center sm:gap-10'}>
      <div
        className={`relative h-[280px] lg:h-auto w-full sm:w-[300px] lg:w-[60%] xl:w-[50%] justify-center items-center flex after:absolute after:pt-2 after:content-['Computed_Units'] after:flex after:items-center after:justify-center after:w-[100px] after:pr-2 after:text-center`}
      >
        <Chart data={itemsToShow} ref={chartRef as any} />
      </div>
      <div id={'legends-container'} className={'flex flex-col grow gap-3 max-w-[220px] lg:max-w-[150px] w-full sm:max-w-[220px] lg:w-[40%] xl:w-[50%]'}>
        {itemsToShow.map((item, index) => {
          const chainColor = hashStringToColor(item.id)

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
                className={`flex items-center justify-between py-1 rounded-sm h-6`}
                style={{
                  backgroundColor: chainColor
                }}
              >
                <p className={'text-white text-xs font-bold text-center w-[50px]'}>
                  {Number(item.percent.toFixed(1))}%</p>
              </div>
              <p className={'text-sm font-bold whitespace-nowrap overflow-hidden overflow-ellipsis'}>
                {item.id}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
