'use client'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useCallback, useMemo, memo } from 'react'
import { getEvolutionVariables } from '@/app/(home)/utils'
import { newEvolutionDocument } from '@/app/(home)/operations'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { fillChartData, LineBarItem, normalizeIsoDate } from '@/app/Charts/utils'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import { formatAmount, formatSimpleAmount } from '@/app/utils/format'
import { useTheme } from 'next-themes'

interface CardEvolutionChartProps {
  title: string
  isLoading?: boolean
  data: Array<EvolutionData>
  dataLabel: string
  valuesAreUPokt?: boolean
  applyMinAndMax?: boolean
}

interface EvolutionData extends LineBarItem {
  value: number
  start_date: string
}

const CardEvolutionChart = memo(function CardEvolutionChartComponent({title, isLoading, ...chartProps }: CardEvolutionChartProps) {
  const {theme = 'dark'} = useTheme();
  const isDark = theme === 'dark'

  const commonTickOptions = useMemo(() => ({
    font: {
      size: 11,
    },
    color: isDark ? '#b9b9b9' : '#3f3f3f',
  }), [isDark])

  const { min, max } = useMemo(() => {
    let min: number | undefined = undefined, max: number | undefined = undefined

    if (chartProps.applyMinAndMax) {
      const {min: dataMin, max: dataMax} = chartProps.data.reduce((acc, item) => {
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

    return { min, max }
  }, [chartProps.applyMinAndMax, chartProps.data])

  const chartData = useMemo(() => ({
    '': chartProps.data
  }), [chartProps.data])

  const colorById = useMemo(() => ({
    '': isDark ? '#b9b9b9' : '#3f3f3f'
  }), [isDark])

  const customDatasetProps = useMemo(() => ({
    tension: 0.3,
    pointRadius: 2,
    borderWidth: 1.5,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    pointHoverRadius: 8,
    animation: {
      duration: 100
    },
  }), [])

  const customOptions = useMemo(() => ({
    scales: {
      y: {
        grace: chartProps.applyMinAndMax ? '' : undefined,
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
            if (chartProps.valuesAreUPokt) {
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
      },
    },
  }), [commonTickOptions, min, max, chartProps.applyMinAndMax, chartProps.valuesAreUPokt, isDark])

  const getTooltipLabel = useCallback((data) => `${chartProps.dataLabel}: ${
    formatAmount({
      includeSymbol: false,
      amount: data.value,
      maxDecimals: 2,
      abbreviateThreshold: Infinity,
      denom: chartProps.valuesAreUPokt ? 'upokt' : undefined
    })
  }`, [chartProps.dataLabel, chartProps.valuesAreUPokt])

  return (
    <div className={'bg-[color:--main-background] pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
      <div className={'h-[41px] p-4 flex items-center border-b border-[color:--divider]'}>
        <p className={'font-semibold text-[15px]'}>
          {title}
        </p>
      </div>
      <div className={'h-[100px] pt-2 pr-3'}>
        <BaseLineBarChart
          chartTypeProp={'line'}
          unitToFormatDate={'day'}
          includeMonthOnXAxis={true}
          data={chartData}
          colorById={colorById}
          isLoading={isLoading}
          yAxisKey={'value'}
          yAxisLabel={''}
          chartType={'line'}
          addProjection={false}
          getCustomDatasetProps={() => customDatasetProps}
          customOptions={customOptions}
          getTooltipLabel={getTooltipLabel}
        />
      </div>
    </div>
  )
})

interface SupplierAndAppsEvolutionProps {
  initialData: DocumentNodeData<typeof newEvolutionDocument> | null
  initialError: boolean
}

function EvolutionChartsComponent({
  initialData,
  initialError
}: SupplierAndAppsEvolutionProps) {
  const lastVariablesRef = React.useRef<ReturnType<typeof getEvolutionVariables>>()
  const variables = useCallback((_: number, currentTime: string) => {
    return lastVariablesRef.current = getEvolutionVariables(currentTime)
  }, [])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: newEvolutionDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

  const {
    validatorsData,
    supplierData,
    supplyData,
    appsData,
  } = useMemo(() => {
    const validatorsData: Array<EvolutionData> = [],
      supplierData: Array<EvolutionData> = [],
      supplyData: Array<EvolutionData> = [],
      appsData: Array<EvolutionData> = []

    if (data) {
      for (const item of data.getLatestBlocksByDay) {
        const date = normalizeIsoDate(item.date)

        validatorsData.push({
          id: 'validators',
          value: Number(item.block.staked_validators),
          point: date,
          start_date: date,
        })

        supplierData.push({
          id: 'suppliers',
          value: Number(item.block.staked_suppliers),
          point: date,
          start_date: date,
        })

        appsData.push({
          id: 'suppliers',
          value: Number(item.block.staked_apps),
          point: date,
          start_date: date,
        })
      }

      for (const item of data.supply) {
        const date = normalizeIsoDate(item.day)

        supplyData.push({
          id: 'supply',
          value: Number(item.total_supply),
          point: date,
          start_date: date,
        })
      }
    }

    if (lastVariablesRef.current) {
      return {
        validatorsData: fillChartData({
          data: validatorsData,
          startDate: lastVariablesRef.current.startDate,
          endDate: lastVariablesRef.current.endDate,
          unitToFormatDate: 'day',
          defaultProps: {
            value: 0,
          }
        }),
        supplierData: fillChartData({
          data: supplierData,
          startDate: lastVariablesRef.current.startDate,
          endDate: lastVariablesRef.current.endDate,
          unitToFormatDate: 'day',
          defaultProps: {
            value: 0,
          }
        }),
        appsData: fillChartData({
          data: appsData,
          startDate: lastVariablesRef.current.startDate,
          endDate: lastVariablesRef.current.endDate,
          unitToFormatDate: 'day',
          defaultProps: {
            value: 0,
          }
        }),
        supplyData: fillChartData({
          data: supplyData,
          startDate: lastVariablesRef.current.startDate,
          endDate: lastVariablesRef.current.endDate,
          unitToFormatDate: 'day',
          defaultProps: {
            value: 0,
          }
        }),
      }
    }

    return {
      validatorsData,
      supplierData,
      appsData,
      supplyData,
    }
  }, [data])

  if (error && !isLoading) {
    return (
      <div className={'bg-[color:--main-background] grow flex rounded-lg border border-[color:--divider] base-shadow p-4'}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={`Oops. There was an error loading the chart's data.`}
        />
      </div>
    )
  } else {
    const loading = isLoading || (!data && !error)
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <CardEvolutionChart
          title={'Supply Evolution (POKT)'}
          data={supplyData}
          dataLabel={'Supply'}
          valuesAreUPokt={!loading}
          applyMinAndMax={!loading}
          isLoading={loading}
        />
        <CardEvolutionChart
          title={'Staked Validators Evolution'}
          data={validatorsData}
          dataLabel={'Staked Validators'}
          isLoading={loading}
        />
        <CardEvolutionChart
          title={'Staked Suppliers Evolution'}
          data={supplierData}
          dataLabel={'Staked Suppliers'}
          isLoading={loading}
        />
        <CardEvolutionChart
          title={'Staked Apps Evolution'}
          data={appsData}
          dataLabel={'Staked Apps'}
          isLoading={loading}
        />
      </div>
    )
  }
}

const EvolutionCharts = memo(EvolutionChartsComponent)
export default EvolutionCharts
