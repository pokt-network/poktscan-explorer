import Table, { GridColDef } from '@/app/components/Table'
import React from 'react'
import { formatAmount, formatSimpleAmount, truncateAddress } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipArrow } from '@radix-ui/react-tooltip'
import CopyIconButton from '@/app/components/CopyIconButton'
import { getClient } from '@/app/config/apollo/rsc'
import { morseClaimableAccountsPageDocument } from '@/app/migration/operations'
import { getPageAndItems } from '@/app/utils/pagination'
import { PageProps } from '@/app/types/pages'
import { MorseClaimableAccountFilter } from '../config/gql/graphql'
import { isValidMorseAddress, isValidPoktAddress } from '@/app/utils/poktroll'
import NewEntitiesSubscription from '@/app/migration/NewEntitiesSubscription'

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

interface MorseClaimableAccountTableProps extends PageProps {
  address?: string
  basePath: string
}

export default async function MorseClaimableAccountTable({searchParams, address, basePath}: MorseClaimableAccountTableProps) {
  const pageInfo = await getPageAndItems(searchParams)

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

  let page = pageInfo.page
  const itemsPerPage = pageInfo.itemsPerPage

  const client = getClient()

  let {data} = await client.query({
    query: morseClaimableAccountsPageDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      filter,
    }
  })

  const totalPages = Math.ceil((data.morseClaimableAccounts?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await client.query({
      query: morseClaimableAccountsPageDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        filter,
      }
    })

    data = result.data
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


  return (
    <>
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
      />
    </>
  )
}

