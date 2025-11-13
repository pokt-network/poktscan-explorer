'use client'

import Table, { GridColDef } from '@/app/components/Table'
import React, { useCallback } from 'react'
import { formatAmount, formatSimpleAmount, truncateAddress } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipArrow } from '@radix-ui/react-tooltip'
import CopyIconButton from '@/app/components/CopyIconButton'
import { morseClaimableAccountsPageDocument } from '@/app/migration/operations'
import { MorseClaimableAccountFilter } from '../config/gql/graphql'
import { isValidMorseAddress, isValidPoktAddress } from '@/app/utils/poktroll'
import NewEntitiesSubscription from '@/app/migration/NewEntitiesSubscription'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { useSearchParams } from 'next/navigation'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { LoadingTable } from '@/app/components/LoadingListView'
import SearchByAddress from '@/app/migration/SearchByAddress'

export interface RowMorseClaimableAccount {
  id: string
  shannonDestAddress: string
  claimedAtHeight?: number
  unstakedBalance: string
  supplierStake: string
  applicationStake: string
  transactionHash?: string
}

export const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'Morse Address',
    maxWidth: 210,
    renderCell: (cell: RowMorseClaimableAccount) => {
      return (
        <div className={"flex flex-row items-center gap-0.5 h-[24px] min-w-0"}>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p>{truncateAddress(cell.id)}</p>
              </TooltipTrigger>
              <TooltipContent side={'top'}>
                <p className={'p-2 bg-[color:--tooltip-background] text-white rounded-lg text-xs base-shadow'}>
                  {cell.id}
                </p>
                <TooltipArrow className={'mt-[-7px] fill-[color:--tooltip-background] stroke-[color:--tooltip-background] stroke-2'} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CopyIconButton
            text={cell.id}
          />
        </div>
      )
    }
  },
  {
    field: 'unstakedBalance',
    headerName: 'Liquid Balance',
    headerAlign: 'right',
    description: 'Liquid balance, balance that is not part of a stake for a node or application'
  },
  {
    field: 'supplierStake',
    headerName: 'Supplier Stake',
    headerAlign: 'right',
    description: 'Node stake amount'
  },
  {
    field: 'applicationStake',
    headerName: 'App Stake',
    headerAlign: 'right',
    description: 'Application stake amount'
  },
  {
    field: 'shannonDestAddress',
    headerName: 'Destination',
    renderCell: (cell: RowMorseClaimableAccount) => {
      if (cell.shannonDestAddress) {
        return (
          <EntityLink
            entity={cell.applicationStake !== '0 POKT' ? 'app' : cell.supplierStake !== '0 POKT' ? 'supplier' : 'account'}
            entityId={cell.shannonDestAddress}
          />
        )
      }

      return '-'
    },
    description: 'Shannon address of the destination account, supplier or app'
  },
  {
    field: 'claimedAtHeight',
    headerName: 'Claimed At',
    renderCell: (cell: RowMorseClaimableAccount) => {
      if (cell.claimedAtHeight) {
        return (
          <EntityLink
            entity={'block'}
            entityId={cell.claimedAtHeight}
          />
        )
      }

      return '-'
    }
  },
  {
    field: 'transactionHash',
    headerName: 'Transaction',
    renderCell: (cell: RowMorseClaimableAccount) => {
      if (cell.transactionHash) {
        return (
          <EntityLink
            entity={'tx'}
            entityId={cell.transactionHash}
          />
        )
      }

      return '-'
    },
    description: 'Transaction hash of the claim transaction, if any'
  },
]

interface MorseClaimableAccountTableProps {
  basePath: string
  address?: string
}

export default function MorseClaimableAccountTable({basePath, address: addressFromProps}: MorseClaimableAccountTableProps) {
  const searchParams = useSearchParams()

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const addressFromSearch = searchParams.get('address') || addressFromProps

  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25

  let address: string | undefined = undefined
  let defaultValueOfSearch: string | undefined = undefined

  if (typeof addressFromSearch === 'string' && (isValidPoktAddress(addressFromSearch) || isValidMorseAddress(addressFromSearch))) {
    address = addressFromSearch
    defaultValueOfSearch = addressFromSearch
  }

  const variables = useCallback(() => {
    let filter: MorseClaimableAccountFilter | undefined = undefined

    if (address) {
      if (isValidPoktAddress(address)) {
        filter = {
          and: [
            {
              shannonDestAddress: {
                equalToInsensitive: address
              }
            }
          ]
        }
      } else if (isValidMorseAddress(address)) {
        filter = {
          or: [
            {
              id: {
                equalToInsensitive: address
              }
            },
            {
              morseOutputAddress: {
                equalToInsensitive: address,
              }
            }
          ]
        }
      }
    }

    return {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      filter,
    }
  }, [page, itemsPerPage, address])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: morseClaimableAccountsPageDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof morseClaimableAccountsPageDocument>,
    initialError: false
  })

  if (isLoading) {
    return (
      <>
        {!addressFromProps && (
          <SearchByAddress defaultValue={defaultValueOfSearch} />
        )}
        <LoadingTable
          columns={columns}
          rowsAmount={itemsPerPage}
        />
      </>
    )
  }

  if (error) {
    return (
      <>
        {!addressFromProps && (
          <SearchByAddress defaultValue={defaultValueOfSearch} />
        )}
        <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
          <BaseRetryError
            onRetry={refetch}
            errorMessage={'Oops. There was an error loading the morse claimable accounts data.'}
          />
        </div>
      </>
    )
  }

  const rows: Array<RowMorseClaimableAccount> = data?.morseClaimableAccounts?.nodes?.map((morseClaimableAccount) => ({
    id: morseClaimableAccount?.id || '',
    shannonDestAddress: morseClaimableAccount?.shannonDestAddress || '',
    claimedAtHeight: morseClaimableAccount?.claimedAtHeight,
    unstakedBalance: formatAmount({
      amount: morseClaimableAccount?.unstakedBalanceAmount || '0',
      denom: morseClaimableAccount?.unstakedBalanceDenom || 'upokt',
    }),
    supplierStake: formatAmount({
      amount: morseClaimableAccount?.supplierStakeAmount || '0',
      denom: morseClaimableAccount?.supplierStakeDenom || 'upokt',
    }),
    applicationStake: formatAmount({
      amount: morseClaimableAccount?.applicationStakeAmount || '0',
      denom: morseClaimableAccount?.applicationStakeDenom || 'upokt',
    }),
    transactionHash: morseClaimableAccount?.transactionId,
  })) || []

  const totalPages = Math.ceil((data?.morseClaimableAccounts?.totalCount || 0) / itemsPerPage)

  return (
    <>
      {!addressFromProps && (
        <SearchByAddress defaultValue={defaultValueOfSearch} />
      )}
      <Table
        header={{
          title: `${formatSimpleAmount(data?.morseClaimableAccounts?.totalCount || 0)} Morse claimable accounts found`,
          subtitle: (
            <NewEntitiesSubscription address={address} />
          )
        }}
        columns={columns}
        rows={rows}
        pagination={{
          currentPage: page,
          totalPages,
          itemsPerPage,
          basePath,
        }}
        csvEndpoint={address ? `/api/export/migration?address=${address}` : '/api/export/migration'}
      />
    </>
  )
}

