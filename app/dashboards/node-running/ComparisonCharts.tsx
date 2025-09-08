'use client'

import React, { useCallback, useMemo } from 'react'
import BoxLabel from '@/app/components/BoxLabel'
import {
  claimProofByTimesDocument,
  claimProofByTimesVariables,
} from '@/app/dashboards/node-running/operations'
import ExportButton from '@/app/components/ExportButton'
import { getTimeBoxLabel, Time } from '@/app/utils/dates'
import useClaimProofData from '@/app/hooks/useClaimProofData'
import ScreenshotButton from '@/app/components/ScreenshotButton'
import ClaimProofExpiredChart, { ChartItem } from '@/app/Charts/ClaimProofExpiredChart'
import { csvColumns, formatterFunction } from '@/app/tools/operator/ComparisonChart/CardActions'

function useNetworkClaimProofData(selectedTime: Time) {
  const variables = useCallback((timestamp: string) => claimProofByTimesVariables(
    timestamp,
    selectedTime,
  ), [selectedTime])

  const {data, refetch, isLoading, error} = useClaimProofData({
    variables,
    document: claimProofByTimesDocument,
  })

  const processedData = useMemo(() => {
    const expired: Array<ChartItem> = [],
      proofs: Array<ChartItem> = [],
      claims: Array<ChartItem> = []

    for (const datum of data) {
      expired.push({
        id: 'expired',
        start_date: datum.start_date,
        point: datum.point,
        amount: datum.expired_proof_amount,
        relays: datum.expired_proof_relays,
        upokt: datum.expired_proof_upokt,
        computedUnits: datum.expired_proof_computed_units,
      })

      proofs.push({
        id: 'proof',
        start_date: datum.start_date,
        point: datum.point,
        amount: datum.proof_amount,
        relays: datum.proof_relays,
        upokt: datum.proof_upokt,
        computedUnits: datum.proof_computed_units,
      })

      claims.push({
        id: 'claim',
        start_date: datum.start_date,
        point: datum.point,
        amount: datum.claim_amount,
        relays: datum.claim_relays,
        upokt: datum.claim_upokt,
        computedUnits: datum.claim_computed_units,
      })
    }

    return {
      claims,
      proofs,
      expired,
    }
  }, [data])

  return {
    rawData: data,
    data: processedData,
    refetch,
    isLoading,
    error,
  }
}

const claimProofExpiredContainerId = 'claimProofExpiredContainerId'

function NetworkClaimProofExpiredChart({ selectedTime, rawData, ...chartProps }: ReturnType<typeof useNetworkClaimProofData> & {
  selectedTime: Time,
}) {
  return (
    <div id={claimProofExpiredContainerId} className={"h-[600px] md:h-[500px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex flex-row px-4 pt-3 pb-1 items-start sm:items-center justify-between'}>
        <div className={'flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 sm:h-7'}>
          <div className={'flex flex-row items-center gap-0 sm:gap-2'}>
            <p className={'text-lg font-semibold leading-7'}>
              Claims/Proofs/Expired
            </p>
            <BoxLabel label={getTimeBoxLabel(selectedTime)} />
          </div>
        </div>

        <div className={'flex flex-row items-center gap-2'}>
          <ScreenshotButton
            baseFileName={'claim_proofs_expired'}
            nodeId={claimProofExpiredContainerId}
          />
          <ExportButton
            columns={csvColumns}
            formatterFunction={formatterFunction}
            fileNameKey={'network_claim_proofs_expired'}
            rows={rawData}
          />
        </div>
      </div>

      <ClaimProofExpiredChart
        onlyShowAmountInTooltip={false}
        {...chartProps}
      />
    </div>
  )
}

const probabilisticProofsContainerId = 'probabilisticProofsContainer'


function ProbabilisticProofsChart({ selectedTime, rawData, ...chartProps }: ReturnType<typeof useNetworkClaimProofData> & {
  selectedTime: Time,
}) {
  return (
    <div id={probabilisticProofsContainerId} className={"h-[600px] md:h-[500px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex flex-row px-4 pt-3 pb-1 items-start sm:items-center justify-between'}>
        <div className={'flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 sm:h-7'}>
          <div className={'flex flex-row items-center gap-0 sm:gap-2'}>
            <p className={'text-lg font-semibold leading-7'}>
              Probabilistic Proofs
            </p>
            <BoxLabel label={getTimeBoxLabel(selectedTime)} />
          </div>
        </div>

        <div className={'flex flex-row items-center gap-2'}>
          <ScreenshotButton
            baseFileName={'network_probabilistic_proofs'}
            nodeId={probabilisticProofsContainerId}
          />
          <ExportButton
            columns={
              csvColumns.filter(column =>
                column.field.endsWith('_amount') &&
                !column.field.startsWith('expired'))
            }
            formatterFunction={formatterFunction}
            fileNameKey={'network_probabilistic_proofs'}
            rows={rawData}
          />
        </div>
      </div>

      <ClaimProofExpiredChart
        yAxisLabel={'Amount'}
        yAxisKey={'amount'}
        hideExpired={true}
        fillProofsLine={false}
        {...chartProps}
      />
    </div>
  )
}

export default function ComparisonCharts({selectedTime}: {selectedTime: Time}) {
  const chartProps = useNetworkClaimProofData(selectedTime)

  return (
    <>
      <NetworkClaimProofExpiredChart
        selectedTime={selectedTime}
        {...chartProps}
      />
      <ProbabilisticProofsChart
        selectedTime={selectedTime}
        {...chartProps}
      />
    </>
  )
}
