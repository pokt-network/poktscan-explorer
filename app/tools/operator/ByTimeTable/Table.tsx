import { Suspense } from 'react'
import ByTimeTableLoader from '@/app/tools/operator/ByTimeTable/Loader'
import { getClient } from '@/app/config/apollo/rsc'
import {
  getDataByDelegatorAddressesAndTimesDocument,
  getDataByDelegatorAddressesAndTimesVariables,
} from '@/app/tools/operator/operations'
import { getLatestBlock } from '@/app/api/blocks'
import DataProvider from '@/app/context/DataContext'
import ByTimeTableCard from '@/app/tools/operator/ByTimeTable/Card'
import ClientByTimeTable from '@/app/tools/operator/ByTimeTable/ClientTable'
import TableCardActions from '@/app/tools/operator/CardActions'
import TimeSelector from '@/app/tools/operator/TimeSelector'

interface ByTimeTableProps {
  timeSelected: string
  addresses: Array<string>
}

async function ServerByTimeTable({timeSelected, addresses}: ByTimeTableProps) {
  const latestBlock = await getLatestBlock()

  const { data } = await getClient().query({
    query: getDataByDelegatorAddressesAndTimesDocument,
    variables: getDataByDelegatorAddressesAndTimesVariables(
      addresses,
      latestBlock.timestamp,
      timeSelected
    )
  })

  return (
    <DataProvider initialData={[]}>
      <ByTimeTableCard
        timeSelected={timeSelected}
        actions={(
          <TableCardActions filenameKey={'by_time_table'}>
            <TimeSelector selectedTime={timeSelected} />
          </TableCardActions>
        )}
      >
        <ClientByTimeTable
          initialData={data}
          timeSelected={timeSelected}
          addresses={addresses}
        />
      </ByTimeTableCard>
    </DataProvider>
  )
}

export default function ByTimeTable({timeSelected, addresses}: ByTimeTableProps) {
  return (
    <Suspense
      key={timeSelected + addresses.join(',')}
      fallback={
        <ByTimeTableLoader timeSelected={timeSelected} />
      }
    >
      <ServerByTimeTable timeSelected={timeSelected} addresses={addresses} />
    </Suspense>
  )
}
