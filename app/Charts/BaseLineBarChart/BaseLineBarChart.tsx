'use client'
import type { Chart as ChartJs } from 'chart.js'
import { Chart, ChartProps } from 'react-chartjs-2'
import { formatAmount, formatSimpleAmount } from '@/app/utils/format'
import {
  ChartLoaderConfigProps,
  formatDate,
  getChartLoaderConfig,
  getCommonChartLoaderOptions,
  getUtcStartOfDay,
  hashStringToColor,
  LineBarItem,
  UnitTimeGroup,
} from '@/app/Charts/utils'
import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import merge from 'lodash/merge'
import { useHeightContext } from '@/app/context/height'
import { getProjection } from '@/app/utils/calculate'

interface BaseLineBarChartProps<T extends LineBarItem> {
  chartType?: 'line' | 'bar'
  data: Record<string, Array<T>>
  yAxisKey: keyof T
  yAxisLabel: string
  colorById?: Record<string, string>
  getTooltipLabel?: (data: T) => string | Array<string> | undefined
  unitToFormatDate?: UnitTimeGroup
  isLoading?: boolean
  customOptions?: Partial<ChartProps>
  customDataLoaderProps?: Partial<ChartLoaderConfigProps>
  formatValueAxisY?: (value: string | number) => string
  displayColorsInTooltip?: boolean
  ref?: React.RefObject<ChartJs<'bar'> | null>
  getCustomDatasetProps?: (id: string) => object
  addProjection?: boolean
  projectionIsUpokt?: boolean
}

export default function BaseLineBarChart<T extends LineBarItem>({
  data,
  colorById,
  chartType = 'line',
  yAxisKey,
  yAxisLabel,
  unitToFormatDate = 'day',
  getTooltipLabel,
  isLoading = false,
  customOptions,
  customDataLoaderProps,
  formatValueAxisY,
  displayColorsInTooltip = true,
  ref,
  getCustomDatasetProps,
  addProjection = true,
  projectionIsUpokt
}: BaseLineBarChartProps<T>) {
  const {theme} = useTheme()
  const {currentTime} = useHeightContext()
  const [colors, setColors] = useState({
    primary: '',
    skeleton: '',
    secondary: '',
  })

  useEffect(() => {
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const style = window.getComputedStyle(document.body)

        setColors({
          primary: style.getPropertyValue('--primary'),
          skeleton: style.getPropertyValue('--skeleton'),
          secondary: style.getPropertyValue('--secondary'),
        })
      }
    }, 0)
  }, [theme])

  const dataEntries = Object.entries(data)

  const projectionDatasets = []

  if (addProjection && chartType === 'bar') {
    for (let i = 0; i < dataEntries.length; i++) {
      const [id, items] = dataEntries[i]

      const latestPoint = items.at(-1)
      const previousPoint = items.at(-2)

      if (latestPoint && getUtcStartOfDay(currentTime || new Date()).toISOString() === latestPoint.point) {
        const original = Number(latestPoint[yAxisKey])

        const projection = getProjection({
          startOfDay: latestPoint.point,
          currentDate: currentTime || new Date(),
          currentValue: (latestPoint[yAxisKey] || 0).toString(),
          previousValue: (previousPoint?.[yAxisKey] || 0).toString(),
          unit: 'days'
        }).toNumber() as T[typeof yAxisKey]

        projectionDatasets.push({
          type: chartType,
          data: [{
            ...latestPoint,
            original,
            [yAxisKey]: projection - original,
          }],
          categoryPercentage: 0.5,
          borderWidth: 0,
          barPercentage: 1,
          backgroundColor: '#95EEB9',
          order: i + 1,
          stack: id,
        })
      }
    }
  }

  const chartData = isLoading
    ? getChartLoaderConfig({
        length: 7,
        xAxisKey: 'point',
        yAxisKey: yAxisKey.toString(),
        chartType: chartType,
        randomValues: true,
        ...customDataLoaderProps,
      })
    : {
    labels: [],
    datasets: dataEntries.map(([id, items], index) => {
      const color = colorById?.[id] || hashStringToColor(id)

      const chartData = [...items]

      if (addProjection && chartType === 'line') {
        const latestPoint = items.at(-1)
        const previousPoint = items.at(-2)

        if (latestPoint && getUtcStartOfDay(currentTime || new Date()).toISOString() === latestPoint.point) {
          const original = Number(latestPoint[yAxisKey])

          chartData[chartData.length - 1] = {
            ...latestPoint,
            [yAxisKey]: getProjection({
              startOfDay: latestPoint.point,
              currentDate: currentTime || new Date(),
              currentValue: (latestPoint[yAxisKey] || 0).toString(),
              previousValue: (previousPoint?.[yAxisKey] || 0).toString(),
              unit: 'days'
            }).toNumber() as T[typeof yAxisKey],
            original,
          }
        }
      }

      const baseProps = {
        type: chartType,
        data: chartData,
        categoryPercentage: 0.5,
        borderWidth: 0,
        barPercentage: 1,
        backgroundColor: color,
        order: index + 1,
      }

      if (chartType === 'line') {
        return {
          ...baseProps,
          tension: 0.1,
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 3,
          borderColor: color,
          ...getCustomDatasetProps?.(id),
          segment: {
            borderDash: (context) => {
              // eslint-disable-next-line
              // @ts-ignore
              return context.p1.raw.original ? [10, 7] : undefined
            },
          }
        }
      }

      if (chartType === 'bar') {
        return {
          ...baseProps,
          barPercentage: 1,
          ...(addProjection && {
            stack: id
          })
          // maxBarThickness: barThickness,
        }
      }
    }).concat(projectionDatasets)
  }

  let options: object = {
    parsing: {
      xAxisKey: 'point',
      yAxisKey: yAxisKey,
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10,
            weight: '400',
            style: 'normal',
          },
          color: colors.secondary,
          callback: function(value) {
            if (isLoading && chartData.labels.length > 0) {
              return chartData.labels[value]
            }

            return formatDate(dataEntries[0][1][value]?.point, unitToFormatDate)
          }
        },
        grid: {
          display: true,
          drawBorder: false,
          lineWidth: 2,
          color: colors.skeleton,
          borderColor: colors.skeleton,
          tickColor: 'transparent',
          tickLength: 6,
        },
      },
      y: {
        grace: chartType === 'bar' ? '40%' : '40%',
        title: {
          display: true,
          text: yAxisLabel,
          color: theme === 'dark' ? '#FFF' : undefined,
          font: {
            weight: '600',
            size: 12,
          },
        },
        ticks: {
          font: {
            size: 10,
            weight: '400',
            style: 'normal',
          },
          color: colors.secondary,
          callback: function (value) {
            if (formatValueAxisY) {
              return formatValueAxisY(value)
            }
            return formatSimpleAmount(value)
          }
        },
        grid: {
          display: true,
          drawBorder: false,
          color: colors.skeleton,
          borderColor: colors.skeleton,
          lineWidth: 2,
          tickColor: 'transparent',
          tickLength: 6,
        },
        beginAtZero: true,
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        boxWidth: 12,
        boxHeight: 12,
        boxPadding: 10,
        display: false,
        font: {
          size: 10,
          weight: '400',
          style: 'normal',
        },
      },
      tooltip: {
        mode: chartType === 'bar' ? 'point' :'nearest',
        intersect: false,
        displayColors: displayColorsInTooltip,
        boxWidth: 8,
        boxHeight: 7,
        caretSize: 8,
        bodySpacing: 5,
        boxPadding: 10,
        clip: false,
        bodyFont: {
          weight: 'bold'
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        titleColor: colors.primary,
        padding: 10,
        callbacks: {
          title: function(tooltipItems) {
            return formatDate(tooltipItems.at(0).label, unitToFormatDate === 'day' ? 'day' : 'hour', unitToFormatDate === 'day')
          },
          label: function(context) {
            const data = context.dataset.data[context.dataIndex] as T

            if (data.original && chartType === 'bar') {
              return [
                'PROJECTED:',
                formatAmount({
                  amount: data.original + data[yAxisKey],
                  denom: projectionIsUpokt ? 'upokt' : undefined,
                  abbreviateThreshold: Infinity,
                  maxDecimals: projectionIsUpokt ? 6 : 2
                }),
              ]
            }

            const labels = getTooltipLabel ? getTooltipLabel({
              ...data,
              [yAxisKey]: data.original || data[yAxisKey],
            }) : context.label

            if (!data.original) return labels

            const labelsToAdd = [
              '',
              'PROJECTED:',
              formatAmount({
                amount: data[yAxisKey],
                denom: projectionIsUpokt ? 'upokt' : undefined,
                abbreviateThreshold: Infinity,
                maxDecimals: projectionIsUpokt ? 6 : 2
              }),
            ]

            if (typeof labels === 'string') {
              return [
                labels,
                ...labelsToAdd,
              ]
            } else {
              labels.push(
                ...labelsToAdd
              )

              return labels
            }
          },
        }
      },
    },
    animations: undefined,
    events: undefined,
  }

  if (isLoading) {
    options = merge(
      options,
      getCommonChartLoaderOptions({
        isLight: theme === 'light',
        chartType,
        from: colors.skeleton
      })
    )
  } else {
    options = {
      ...options,
      animations: {
        y: {
          duration: 0
        }
      },
    }
  }

  if (customOptions) {
    options = merge(options, customOptions)
  }

  return (
    <Chart
      ref={ref}
      type={'bar'}
      data={chartData}
      redraw={false}
      options={options}
    />
  )
}
