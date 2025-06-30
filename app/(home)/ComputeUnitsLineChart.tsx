'use client'
import {Line} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useRef } from 'react'
import millify from 'millify'
import { useTheme } from 'next-themes'
import { formatDate, LineBarItem } from '@/app/Charts/utils'
import { convertUpoktToPokt, formatSimpleAmount } from '@/app/utils/format'

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Item = {
  totalRelays: number;
  totalComputedUnits: number;
  totalPokt: number;
} & LineBarItem

export interface ComputeUnitsLineChartProps {
  data: Array<Item>;
}

export default function ComputeUnitsLineChart({data}: ComputeUnitsLineChartProps) {
  const {theme = 'dark'} = useTheme();
  const isDark = theme === 'dark'
  const chartRef= useRef<ChartJS<'line'>>()

  const labels = data.map((item) => item.point);
  const allHaveTheSameValue = data.every((item) => item.totalComputedUnits === data[0].totalComputedUnits);

  return (
    <Line
      // eslint-disable-next-line
      ref={chartRef as any}
      style={{
        // minWidth: '100%',
        width: '100%',
        height: '100%',
      }}
      data={{
        labels,
        datasets: [
          {
            data,
            label: 'Compute Units',
            tension: 0.5,
            pointRadius: 8,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            pointHoverRadius: 8,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'transparent',
            pointBorderWidth: 0,
            borderWidth: 1.5,
          }
        ]
      }}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        parsing: {
          xAxisKey: 'point',
          yAxisKey: 'totalComputedUnits'
        },
        scales:{
          y: {
            border: {
              display: false,
            },
            grid: {
              display: false,
              tickLength: 26
            },
            ticks: {
              maxRotation: 0,
              color: isDark ? '#b9b9b9' : '#3f3f3f',
              font: {
                size: 11,
              },
              callback: function(value, index, ticks) {
                if (allHaveTheSameValue) {
                  if (index === Math.floor(ticks.length / 2)) {
                    return millify(ticks[index].value);
                  }
                } else if (index === 0 || index === ticks.length - 1) {
                  return millify(Number(value));
                }
              }
            },
          },
          x: {
            border: {
              display: false,
            },
            grid: {
              display: false,
              tickLength: 15
            },
            ticks: {
              maxRotation: 0,
              color: isDark ? '#b9b9b9' : '#3f3f3f',
              font: {
                size: 11,
              },
              align: 'center',
              callback: function(_, index,) {
                if (index === 0 || index === labels.length - 1 || index === Math.floor(labels.length / 2)) {
                  return formatDate(labels[index], 'day', true);
                }
              }
            }
          }
        },
        borderColor: isDark ? 'rgb(147,147,147)' : '#808080',
        hover: {
          mode: 'nearest',
          intersect: false,
        },
        hoverBackgroundColor: 'rgba(147,147,147, 0.4)',
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'nearest',
            backgroundColor: isDark ? 'rgb(61,61,61)' : 'rgb(89,89,89)',
            intersect: false,
            displayColors: false,
            bodySpacing: 5,
            bodyFont: {
              weight: 'bold'
            },
            titleFont: {
              weight: 'normal'
            },
            padding: 10,
            callbacks: {
              title: function(context) {
                const label = context.at(0)!.label

                if (!label) return ''

                return formatDate(label, 'day', true)
              },
              label: function(context) {
                const data = context.dataset.data[context.dataIndex] as unknown as Item

                return [
                  `Computed Units: ${formatSimpleAmount(data?.totalComputedUnits || 0)}`,
                  `Relays: ${formatSimpleAmount(data?.totalRelays || 0)}`,
                  `POKT: ${formatSimpleAmount(convertUpoktToPokt(data?.totalPokt || 0))}`
                ]
              },
            }
          },
          legend: {
            display: false,
          },
        }
      }}
    />
  )
}
