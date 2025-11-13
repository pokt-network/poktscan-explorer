import DataProvider from '@/app/context/DataContext'
import LastClaimingWindowTableCard from '@/app/tools/operator/ClaimProofTable/Card'
import ClientLastClaimingWindowTable from '@/app/tools/operator/ClaimProofTable/ClientTable'
import TableCardActions from '@/app/tools/operator/CardActions'
import { Time } from '@/app/utils/dates'

interface LastClaimingWindowTableProps {
  addresses: Array<string>
  time: Time
}

export default async function ServerLastClaimingWindowTable({addresses, time}: LastClaimingWindowTableProps) {
  return (
    <DataProvider initialData={[]}>
      <LastClaimingWindowTableCard
        actions={
          <TableCardActions
            filenameKey={`${time}_table`}
          />
        }
      >
        <ClientLastClaimingWindowTable
          addresses={addresses}
          initialData={null}
          initialError={false}
        />
      </LastClaimingWindowTableCard>
    </DataProvider>
  )
}
