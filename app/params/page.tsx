import { getClient } from '@/app/config/apollo/rsc'
import { paramsDocument } from '@/app/params/operations'
import ParamList from '@/app/params/ParamList'
import { Suspense } from 'react'
import ParamsLoader from '@/app/params/Loader'

export const dynamic = "force-dynamic";

async function ServerParamsPage() {
  let data, error = false

  try {
    const response = await getClient().query({
      query: paramsDocument
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <ParamList initialData={data} initialError={error} />
  )
}

export default async function ParamsPage() {
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <Suspense
        fallback={
          <ParamsLoader />
        }
      >
        <ServerParamsPage />
      </Suspense>
    </div>
  )
}
