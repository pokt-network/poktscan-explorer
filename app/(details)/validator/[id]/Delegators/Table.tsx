import type { GridColDef } from '@/app/components/Table'
import Big from 'big.js'
import React from 'react'
import BaseTable from '@/app/components/BaseTable'
import EntityLink from '@/app/components/EntityLink'
import { RefreshPageError } from '@/app/components/ErrorBoundary'
import { formatUpokt, formatSimpleAmount } from '@/app/utils/format'

const rpcUrl = process.env.RPC_BASE_URL!

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

async function getValidatorDelegators(valoperAddress: string, rpcUrl: string) {
  const allDelegations: DelegatorsResponseFromRpc['delegation_responses'] = [];
  let nextKey = undefined;

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

export default async function ValidatorDelegatorsTable({valoperAddress}: ValidatorDelegatorsTableProps) {
  try {
    const delegators = await getValidatorDelegators(valoperAddress, rpcUrl)

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
  } catch {
    return (
      <RefreshPageError />
    )
  }
}
