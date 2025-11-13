'use client'
import {Line} from 'react-chartjs-2'
import { useTheme } from 'next-themes'
import { formatAmount, formatSimpleAmount } from '@/app/utils/format'
import { formatDate } from '@/app/Charts/utils'

interface DataPoint {
  point: string
  value: number
}

export interface CommonLineChartProps {
  data: Array<DataPoint>
  valuesAreUPokt?: boolean
  dataLabel?: string
  applyMinAndMax?: boolean
}

export default function CommonLineChart({
  data,
  dataLabel,
  valuesAreUPokt = false,
  applyMinAndMax = false
}: CommonLineChartProps) {
  const {theme = 'dark'} = useTheme();
  const isDark = theme === 'dark'

  // const backgroundColor
  const commonTickOptions = {
    font: {
      size: 11,
    },
    color: isDark ? '#b9b9b9' : '#3f3f3f',
  }

  let min: number | undefined = undefined, max: number | undefined = undefined

  if (applyMinAndMax) {
    const {min: dataMin, max: dataMax} = data.reduce((acc, item) => {
      if (item.value < acc.min) {
        acc.min = item.value
      }

      if (item.value > acc.max) {
        acc.max = item.value
      }

      return acc
    }, {max: 0, min: Number.MAX_SAFE_INTEGER})

    min = dataMin * 0.9
    max = dataMax * 1.1
  }

  const labels = data.map(({point}) => formatDate(point, 'day', true))

  return (
    <div className={'h-[100px] px-3 py-2'}>
      <Line
        style={{
          minHeight: '100%',
          maxHeight: '100%',
          minWidth: '100%',
          maxWidth: '100%',
        }}
        data={{
          labels: data.map((item) => item.point),
          datasets: [
            {
              label: dataLabel,
              data,
              tension: 0.3,
              pointRadius: 2,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              pointHoverRadius: 8, animation: {
                duration: 100
              },
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          parsing: {
            xAxisKey: 'point',
            yAxisKey: 'value',
          },
          scales: {
            y: {
              border: {
                display: false,
              },
              grid: {
                display: false,
                tickLength: 20
              },
              ticks: {
                ...commonTickOptions,
                maxRotation: 0,
                stepSize: min ? ((min + max!) / 2) - min : undefined,
                callback: function (value) {
                  if (valuesAreUPokt) {
                    return formatAmount({
                      amount: value,
                      denom: 'upokt',
                    }).split(' ').at(0)
                  }

                  return formatSimpleAmount(value)
                },
              },
              min,
              max,
            },
            x: {
              border: {
                display: false,
              },
              ticks: {
                ...commonTickOptions,
                maxRotation: 0,
                autoSkipPadding: 0.3,
                callback: function (_, index) {
                  return labels[index]
                }
              },
              grid: {
                tickLength: 15,
                display: false,
              },
            },
          },
          borderColor: isDark ? 'rgb(147,147,147)' : '#808080',
          hover: {
            mode: 'nearest',
            intersect: false,
          },
          hoverBackgroundColor: 'rgba(147,147,147, 0.4)',
          datasets: {
            line: {
              tension: 0,
              borderWidth: 2,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              backgroundColor: isDark ? 'rgb(61,61,61)' : 'rgb(89,89,89)',
              mode: 'nearest',
              intersect: false,
              displayColors: false,
              bodyFont: {
                weight: 'bold'
              },
              titleFont: {
                weight: 'normal'
              },
              padding: 10,
              callbacks: {
                title(tooltipItems) {
                  return tooltipItems.map((item) => formatDate(item.label, 'day', true))
                },
                label: (tooltipItem) => {
                  let amount = (tooltipItem.raw as DataPoint).value.toString()

                  if (valuesAreUPokt) {
                    amount = formatAmount({amount, denom: 'upokt', abbreviateThreshold: Infinity, maxDecimals: 2})
                  } else {
                    amount = formatAmount({ amount, abbreviateThreshold: Infinity, maxDecimals: 2 })
                  }
                  return `${dataLabel}: ${amount}`
                }
              }
            },
          },
        }}
      />
    </div>
  )
}
