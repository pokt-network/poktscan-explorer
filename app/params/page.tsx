import { getClient } from '@/app/config/apollo/rsc'
import { paramsDocument } from '@/app/params/operations'
import ParamList from '@/app/params/ParamList'

export const dynamic = "force-dynamic";

export default async function ParamsPage() {
  const { data } = await getClient().query({
    query: paramsDocument
  })

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ParamList initialData={data} />
    </div>
  )
}
