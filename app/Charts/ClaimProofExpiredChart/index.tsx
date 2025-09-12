import type { LineBarItem } from '@/app/Charts/utils'
import { useCallback, useRef, useState } from 'react'
import { Chart as ChartJs, TooltipItem } from 'chart.js'
import { useSelectedTime } from '@/app/Charts/SelectedTime'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { formatAmount, formatUpokt } from '@/app/utils/format'
import LegendItem from '@/app/Charts/LegendItem'
import { Time } from '@/app/utils/dates'

const legendItems = [
  {
    label: 'Claim',
    color: '#B7ABFF',
  },
  {
    label: 'Proof',
    color: '#00CF9D',
  },
  {
    label: 'Expired Proof',
    color: '#E95626',
  },
]

export interface ChartItem extends LineBarItem {
  start_date: string
  amount: number,
  relays: number,
  upokt: number,
  computedUnits: number
}

interface ClaimProofExpiredChartProps {
  data: {
    claims: Array<ChartItem>
    proofs: Array<ChartItem>
    expired: Array<ChartItem>
  }
  error: boolean
  refetch: () => void
  isLoading: boolean
  yAxisKey?: keyof ChartItem
  yAxisLabel?: string
  hideExpired?: boolean
  fillProofsLine?: boolean
  onlyShowAmountInTooltip?: boolean
}

export default function ClaimProofExpiredChart({
  data,
  refetch,
  isLoading,
  error,
  yAxisKey = 'computedUnits',
  yAxisLabel = 'Computed Units',
  hideExpired = false,
  fillProofsLine = true,
  onlyShowAmountInTooltip = true,
}: ClaimProofExpiredChartProps) {
  const chartRef = useRef<ChartJs<'bar'>>(null)
  const {selectedTime} = useSelectedTime()

  const [hiddenDatasets, setHiddenDatasets] = useState<Array<number>>([])

  const onItemLegendClick = useCallback(
    (index: number) => {
      if (chartRef?.current) {
        chartRef.current.toggleDataVisibility(index)
        const meta = chartRef.current.getDatasetMeta(index)


        if (meta.hidden) {
          setHiddenDatasets((prevState) => [...prevState, index])
        } else {
          setHiddenDatasets((prevState) => prevState.filter((value) => value !== index))
        }

        chartRef.current.update('none')
      }
    },
    []
  )


  if (error && !isLoading) {
    return (
      <BaseRetryError
        onRetry={refetch}
      />
    )
  }

  return (
    <>
      <div className={'px-4 flex flex-row flex-wrap gap-x-8 gap-y-2 pt-2 pb-6'}>
        {(hideExpired ? legendItems.slice(0, 2) : legendItems).map((item, index) => {
          const datasetIndex = index // legendItems.length - index - 1
          return (
            <LegendItem
              key={index}
              label={item.label}
              boxColor={hiddenDatasets.includes(datasetIndex) ? 'rgba(93, 93, 93, 0.5)' : item.color}
              onClick={() => onItemLegendClick(datasetIndex)}
              loading={isLoading || (!data && !error)}
            />
          )
        })}
      </div>
      <div className={'h-[calc(100%-60px-48px)] px-4'}>
        <BaseLineBarChart
          data={{
            claims: data?.claims || [],
            proofs: data?.proofs || [],
            ...(!hideExpired && {
              expired: data?.expired || [],
            })
          }}
          ref={chartRef}
          yAxisKey={yAxisKey}
          yAxisLabel={yAxisLabel}
          isLoading={isLoading}
          chartType={'line'}
          unitToFormatDate={[Time.Last24h, Time.Last48h].includes(selectedTime) ? 'hour' : 'day'}
          getTooltipLabel={(item) => {
            if (onlyShowAmountInTooltip) {
              return `Amount: ${formatAmount({
                amount: item.amount,
                maxDecimals: 0,
                abbreviateThreshold: Infinity,
              })}`
            }

            return [
              `Amount: ${formatAmount({
                amount: item.amount,
                maxDecimals: 0,
                abbreviateThreshold: Infinity,
              })}`,
              `Relays: ${formatAmount({
                amount: item.relays,
                maxDecimals: 0,
                abbreviateThreshold: Infinity,
              })}`,
              `POKT: ${formatUpokt({
                includeSymbol: false,
                amount: item.upokt,
                maxDecimals: 6,
                abbreviateThreshold: Infinity,
              })}`,
              `Computed Units: ${formatAmount({
                amount: item.computedUnits,
                maxDecimals: 0,
                abbreviateThreshold: Infinity,
              })}`,
            ]
          }}
          displayColorsInTooltip={false}
          colorById={{
            'expired': '#E95626',
            'claims': '#B7ABFF',
            'proofs': '#00CF9D',
          }}
          getCustomDatasetProps={(id) => {
            if (id === 'proofs' && fillProofsLine) {
              return {
                fill: true,
                backgroundColor: 'rgba(0, 207, 157, 0.1)',
              }
            }

            return {
            }
          }}
          customOptions={{
            plugins: {
              tooltip: {
                footerColor: '#9e9e9e',
                footerFont: {
                  size: 11,
                  weight: 'bold',
                  family: 'Roboto'
                },
                footerMarginTop: 10,
                callbacks: {
                  footer: (items: Array<TooltipItem<'bar'>>) => {
                    const item = items.at(0)

                    if (item) {
                      const rawItem = item.raw as ChartItem

                      if (rawItem.id === 'expired') {
                        return 'EXPIRED PROOF'
                      }
                      if (rawItem.id === 'claim') {
                        return 'CLAIM'
                      }
                      if (rawItem.id === 'proof') {
                        return 'PROOF'
                      }
                    }
                  }
                }
              }
            }
          }}
        />
      </div>
    </>
  )
}
