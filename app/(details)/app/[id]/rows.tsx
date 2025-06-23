import { Item } from '@/app/components/EntityDetail'
import { formatUpokt } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Application } from '@/app/(details)/app/[id]/getApp'

export default function getRows(app: Application | null, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: skeleton || formatUpokt({
        amount: app?.balance || '0',
      })
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Status',
      value: skeleton || app!.status
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: skeleton || formatUpokt({
        amount: app?.stake || '0',
      })
    },
    {
      type: 'row',
      label: !app ? 'Service' : app.services.length === 1 ? 'Service' : 'Services',
      value: skeleton || (
        <ul>
          {app?.services?.map((service) => (
            <li key={service}>
              <p className={"text-sm"}>
                {service}
              </p>
            </li>
          ))}
        </ul>
      )
    },
  ]

  if (!isLoading && app?.status !== 'Staked' && app?.unstakingBeginAt) {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Unstaking Begins At',
        value: (
          <div className={"text-sm"}>
            <EntityLink entity={'block'} entityId={app.unstakingBeginAt} copy={{ enabled: true }} />
          </div>
        )
      }
    )

    if (app.unstakedAt) {
      rows.push({
        type: 'row',
        label: 'Unstaked At',
        value: (
          <div className={"text-sm"}>
            <EntityLink entity={'block'} entityId={app.unstakedAt} copy={{ enabled: true }} />
          </div>
        )
      })
    } else if (app.unstakingEndsAt) {
      rows.push({
        type: 'row',
        label: 'Unstaking Ends At',
        value: (
          <div className={"text-sm"}>
            <EntityLink entity={'block'} entityId={app.unstakingEndsAt} copy={{ enabled: true }} />
          </div>
        )
      })
    }
  }

  if (!isLoading && app!.transferredFrom) {
    rows.push({
      type: 'row',
      label: 'Transferred From',
      value: (
        <EntityLink entity={'app'} entityId={app!.transferredFrom} copy={{enabled: true}}/>
      )
    }, {
      type: 'row',
      label: 'Transferred At',
      value: (
        <EntityLink entity={'block'} entityId={app!.transferredAt!} copy={{enabled: true}}/>
      )
    })
  }

  if (!isLoading && app!.transferringTo) {
    rows.push({
      type: 'row',
      label: 'Transferring To',
      value: (
        <EntityLink entity={'account'} entityId={app!.transferringTo} copy={{enabled: true}}/>
      )
    }, {
      type: 'row',
      label: 'Transfer Ends At',
      value: (
        <EntityLink entity={'block'} entityId={app!.transferEndHeight!} copy={{enabled: true}}/>
      )
    })
  }

  if (!isLoading && app!.transferredTo) {
    rows.push({
      type: 'row',
      label: 'Transferred To',
      value: (
        <EntityLink entity={'app'} entityId={app!.transferredTo} copy={{enabled: true}}/>
      )
    }, {
      type: 'row',
      label: 'Transferred At',
      value: (
        <EntityLink entity={'block'} entityId={app!.transferEndedAt!} copy={{enabled: true}}/>
      )
    })
  }

  return rows
}
