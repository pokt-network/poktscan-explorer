'use client'

import ListTitle from '@/app/components/ListTitle'
import React from 'react'
import MorseClaimableAccountTable from '@/app/migration/Table'
import Summary from '@/app/migration/Summary'
import { LabelByIndex } from '@/app/components/FourCards/utils'

const summaryLabels: LabelByIndex = {
  1: 'Total Claimed',
  2: 'Claimed Liquid Balance',
  3: 'Claimed Supplier Stake',
  4: 'Claimed App Stake',
}

export default function MigrationPage() {
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Morse Claimable Accounts'} />
      <Summary initialData={null} initialError={false} labels={summaryLabels} />
      <MorseClaimableAccountTable basePath={'/migration'} />
    </div>
  )
}
