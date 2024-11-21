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
import { useTheme } from 'next-themes'
import millify from 'millify'

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

export interface CommonLineChartProps {
  data: Array<{
    label: string
    value: number
  }>
  dataLabel?: string
}

export default function CommonLineChart({data, dataLabel}: CommonLineChartProps) {
  const {theme = 'dark'} = useTheme();
  const isDark = theme === 'dark'

  // const backgroundColor
  const commonTickOptions = {
    font: {
      size: 11,
    },
    color: isDark ? '#b9b9b9' : '#3f3f3f',
  }

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
          labels: data.map(({label}) => label),
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
            xAxisKey: 'label',
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
                callback: function (value) {
                  return millify(Number(value))
                },
              },
            },
            x: {
              border: {
                display: false,
              },
              ticks: {
                ...commonTickOptions,
                maxRotation: 0,
                autoSkipPadding: 0.3,
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
              // borderColor: theme.customColors.dark50,
              borderWidth: 2,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              mode: 'nearest',
              backgroundColor: isDark ? 'rgb(61,61,61)' : 'rgb(89,89,89)',
              intersect: false,
              displayColors: false,
              bodyFont: {
                weight: 'bold'
              },
              titleFont: {
                weight: 'normal'
              },
              padding: 10,
            },
          },
        }}
        // plugins={[chartAreaBorder, backgroundPlugin, staticIndicator]}
      />
    </div>
  )
}
