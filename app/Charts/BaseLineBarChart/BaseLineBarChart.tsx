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
  getUtcStartOfHour,
  hashStringToColor,
  LineBarItem,
  UnitTimeGroup,
} from '@/app/Charts/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import merge from 'lodash/merge'
import { useHeightContext } from '@/app/context/height'
import { getProjection } from '@/app/utils/calculate'

interface BaseLineBarChartProps<T extends LineBarItem> {
  chartType?: 'line' | 'bar'
  chartTypeProp?: 'line' | 'bar'
  includeMonthOnXAxis?: boolean
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
  chartTypeProp = 'bar',
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
  projectionIsUpokt,
  includeMonthOnXAxis
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

  const chartData = useMemo(() => {
    const dataEntries = Object.entries(data)

    const projectionDatasets = []

    const getStartOfPoint = unitToFormatDate === 'hour' ? getUtcStartOfHour : getUtcStartOfDay

    if (addProjection && chartType === 'bar') {
      for (let i = 0; i < dataEntries.length; i++) {
        const [id, items] = dataEntries[i]

        const latestPoint = items.at(-1)
        const previousPoint = items.at(-2)

        if (latestPoint && getStartOfPoint(currentTime || new Date()).toISOString() === latestPoint.point) {
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

    return isLoading
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

            if (latestPoint && getStartOfPoint(currentTime || new Date()).toISOString() === latestPoint.point) {
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
                  if (typeof context.p1.raw.original === 'number') {
                    let segmentLength = Math.sqrt(
                      Math.pow(context.p1.x - context.p0.x, 2) +
                      Math.pow(context.p1.y - context.p0.y, 2)
                    );


                    const percent = (context.p1.raw.original / context.p1.raw[yAxisKey])
                    const segmentLengthPercent = segmentLength * percent;

                    const dashes = [segmentLengthPercent]
                    segmentLength -= segmentLengthPercent;

                    let transparent = true

                    let transparentDashLength = 5

                    if (percent > 0.7) {
                      transparentDashLength = 2
                    } else if (percent > 0.5) {
                      transparentDashLength = 3
                    }

                    while (segmentLength > 0) {
                      let newDash = segmentLength

                      if (transparent && newDash >= transparentDashLength) {
                        transparent = false
                        newDash = transparentDashLength
                      } else if (!transparent && newDash >= 5) {
                        transparent = true
                        newDash = 5
                      }

                      segmentLength -= newDash

                      dashes.push(newDash)
                    }

                    return dashes
                  }
                  return undefined;
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
  }, [isLoading, yAxisKey, chartType, customDataLoaderProps, data, colorById, addProjection, currentTime, unitToFormatDate, getCustomDatasetProps])

  const options = useMemo(() => {
    let opts: object = {
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

              const firstDataset = Object.values(data)[0]
              return formatDate(firstDataset?.[value]?.point, unitToFormatDate, includeMonthOnXAxis)
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

              if (typeof data.original === 'number' && chartType === 'bar' && data.original + data[yAxisKey] > 0) {
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
                [yAxisKey]: typeof data.original === 'number' ? data.original : data[yAxisKey],
              }) : context.label

              if (typeof data.original !== 'number' || data.original === 0) return labels

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
      opts = merge(
        opts,
        getCommonChartLoaderOptions({
          isLight: theme === 'light',
          chartType,
          from: colors.skeleton
        })
      )
    } else {
      opts = {
        ...opts,
        animations: {
          y: {
            duration: 0
          }
        },
      }
    }

    if (customOptions) {
      opts = merge(opts, customOptions)
    }

    return opts
  }, [yAxisKey, colors, isLoading, chartData, data, unitToFormatDate, includeMonthOnXAxis, chartType, yAxisLabel, theme, formatValueAxisY, displayColorsInTooltip, projectionIsUpokt, getTooltipLabel, customOptions])

  return (
    <Chart
      ref={ref}
      type={chartTypeProp}
      data={chartData}
      redraw={false}
      options={options}
    />
  )
}
