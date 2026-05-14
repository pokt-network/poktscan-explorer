'use client'

import type { GridColDef } from '@/app/components/Table'
import Big from 'big.js'
import React, { useEffect, useState } from 'react'
import BaseTable from '@/app/components/BaseTable'
import EntityLink from '@/app/components/EntityLink'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { formatUpokt, formatSimpleAmount } from '@/app/utils/format'
import { Skeleton } from '@/components/ui/skeleton'
import { useRpcUrl } from '@/app/context/rpcUrl'

export type DelegatorsResponseFromRpc = {
  delegation_responses: Array<{
    delegation: {
      delegator_address: string
      validator_address: string
      shares: string
    }
    balance: {
      denom: string
      amount: string
    }
  }>
  pagination: {
    next_key: any
    total: string
  }
}

async function getValidatorDelegators(valoperAddress: string, rpcUrl: string): Promise<DelegatorsResponseFromRpc['delegation_responses']> {
  const allDelegations: DelegatorsResponseFromRpc['delegation_responses'] = [];
  let nextKey: string | null = null;

  do {
    const url = new URL(
      `${rpcUrl}/cosmos/staking/v1beta1/validators/${valoperAddress}/delegations`
    );

    if (nextKey) {
      url.searchParams.set("pagination.key", nextKey);
    } else {
      url.searchParams.set("pagination.limit", "100");
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json: DelegatorsResponseFromRpc = await res.json();
    allDelegations.push(...json.delegation_responses);

    nextKey = json.pagination?.next_key || null;
  } while (nextKey);

  return allDelegations;
}

function DelegatorsTableLoader() {
  const row = (
    <div className={'h-[56px] flex flex-row items-center gap-2 border-b border-[color:--divider] px-4'}>
      <Skeleton className={'h-5 w-32'} />
      <Skeleton className={'h-5 w-24 ml-auto'} />
      <Skeleton className={'h-5 w-20'} />
      <Skeleton className={'h-5 w-24'} />
    </div>
  )

  return (
    <div className={"w-full h-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow pt-4"}>
      <div>
        {row}
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  )
}

export const validatorDelegatorsColumns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'Delegator',
    minWidth: 200,
    renderCell: (cell: RowValidatorDelegator) => (
      <div className={'text-xs md:text-sm font-medium'}>
        <EntityLink
          entity={'supplier'}
          entityId={cell.id}
        />
      </div>
    )
  },
  {
    field: 'staked',
    headerName: 'Staked',
    align: 'right',
  },
  {
    field: 'stakePercent',
    headerName: 'Stake Percent',
    align: 'right'
  },
  {
    field: 'shares',
    headerName: 'Shares',
    align: 'right',
  }
]

export interface RowValidatorDelegator {
  id: string
  staked: string
  stakePercent: string
  shares: string
  numShares: number
}

interface ValidatorDelegatorsTableProps {
  valoperAddress: string
}

export default function ValidatorDelegatorsTable({valoperAddress}: ValidatorDelegatorsTableProps) {
  const rpcUrl = useRpcUrl()
  const [delegators, setDelegators] = useState<DelegatorsResponseFromRpc['delegation_responses'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setError(false)
    getValidatorDelegators(valoperAddress, rpcUrl)
      .then(data => {
        setDelegators(data)
        setIsLoading(false)
      })
      .catch(() => {
        setError(true)
        setIsLoading(false)
      })
  }, [valoperAddress])

  const refetch = () => {
    setIsLoading(true)
    setError(false)
    getValidatorDelegators(valoperAddress, rpcUrl)
      .then(data => {
        setDelegators(data)
        setIsLoading(false)
      })
      .catch(() => {
        setError(true)
        setIsLoading(false)
      })
  }

  if (isLoading) {
    return <DelegatorsTableLoader />
  }

  if (error) {
    return (
      <div className={"w-full h-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow pt-4"}>
        <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1"}>
          <BaseRetryError
            onRetry={refetch}
            errorMessage={'Oops. There was an error loading the delegators data.'}
          />
        </div>
      </div>
    )
  }

  if (!delegators) {
    return <DelegatorsTableLoader />
  }

  const total = delegators.reduce((acc, item) => acc.plus(item.balance.amount), new Big(0))

  const rows: Array<RowValidatorDelegator> = delegators.map(delegation => {
    return {
      id: delegation.delegation.delegator_address,
      staked: formatUpokt({ amount: delegation.balance.amount, maxDecimals: 6 }),
      stakePercent: `${new Big(delegation.balance.amount).div(total).mul(100).toFixed(3)}%`,
      shares: formatSimpleAmount(delegation.delegation.shares),
      numShares: Number(delegation.delegation.shares)
    }
  }).sort((a, b) => b.numShares - a.numShares)

  return (
    <div className={"w-full h-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow pt-4"}>
      <BaseTable columns={validatorDelegatorsColumns} rows={rows} />
    </div>
  )
}
