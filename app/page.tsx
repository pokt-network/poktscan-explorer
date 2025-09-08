import type { DocumentNodeData, ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import SearchInput from '@/app/Search/Search'
import { getClient } from '@/app/config/apollo/rsc'
import { getEvolutionVariables, getServicesVariables, getSummaryVariables } from '@/app/(home)/utils'
import EvolutionCharts from '@/app/(home)/EvolutionCharts/EvolutionCharts'
import ServicesCard from '@/app/(home)/Services/ServicesCard'
import { getLatestBlock } from '@/app/api/blocks'
// import SponsoredLabel from '@/app/components/SponsoredLabel'
import { evolutionDocument, servicesDocument, summaryDocument } from '@/app/(home)/operations'
import CustomizableCompUnits from '@/app/(home)/CustomizableCompUnitsChart'
import Summary from '@/app/(home)/Summary'
import SummaryLoader from '@/app/(home)/SummaryLoader'
import { Suspense } from 'react'
import EvolutionChartsLoader from '@/app/(home)/EvolutionCharts/Loader'
import ServicesLoader from '@/app/(home)/Services/Loader'

export const dynamic = "force-dynamic";

async function ServerSummary() {
  let data, error = false, variables: ExtractVariables<typeof summaryDocument>

  try {
    const latestBlock = await getLatestBlock()
    variables = getSummaryVariables(latestBlock.timestamp)
    const response = await getClient().query({
      query: summaryDocument,
      variables,
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <Summary
      initialData={data as DocumentNodeData<typeof summaryDocument>}
      initialError={error}
      initialVariables={variables!}
    />
  )
}

async function ServerEvolutionCharts() {
  let data, error = false

  try {
    const latestBlock = await getLatestBlock()
    const response = await getClient().query({
      query: evolutionDocument,
      variables: getEvolutionVariables(latestBlock.timestamp)
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <EvolutionCharts initialData={data} initialError={error} />
  )
}

async function ServerServicesCard({defaultType}: {defaultType: string}) {
  let data, error = false

  try {
    const latestBlock = await getLatestBlock()

    const response = await getClient().query({
      query: servicesDocument,
      variables: getServicesVariables(latestBlock.timestamp)
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <ServicesCard
      initialData={data as DocumentNodeData<typeof servicesDocument>}
      initialError={error}
      defaultType={defaultType}
    />
  )
}

const rpcUrl = process.env.RPC_BASE_URL!

export default async function Home({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const search = await searchParams
  const serviceContentType = search['dashboard_services_card']?.toString() || 'chart'

  return (
    <>
      <section
        className='pt-7 relative md:pt-[56px] pb-[95px] px-4 md:px-5'
      >
        <h1 className='text-white text-lg font-bold leading-[24px] mb-3'>
          The Pocket Network Explorer
        </h1>
        <div className={'absolute z-[-1] w-[100vw] left-[calc((50%-50vw))] top-0 right-0 h-full bg-[color:#081d35] dark:bg-[color:rgb(10,10,10)]'}
             style={{ backgroundImage: 'url(/waves-light.svg)' }}
        />
        <div className={'w-full md:w-[480px] lg:w-[580px] mb-[12px]'}>
          <SearchInput zIndex={100} height={48} rpcUrl={rpcUrl} />
        </div>
        {/*<SponsoredLabel />*/}
      </section>
      <div className={'px-4 md:px-5 pb-4 mt-[-46px]'}>
        <Suspense
          fallback={
            <SummaryLoader />
          }
        >
          <ServerSummary />
        </Suspense>
      </div>

      <div className={'px-4 md:px-5 pb-4'}>
        <CustomizableCompUnits />
      </div>

      <div className={'px-4 md:px-5 pb-10 flex lg:flex-row flex-col gap-4'}>
        <div className={'w-full lg:w-[50%] flex flex-col gap-4 h-[652px]'}>
          <Suspense
            fallback={
              <EvolutionChartsLoader />
            }
          >
            <ServerEvolutionCharts />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <ServicesLoader defaultType={serviceContentType} />
          }
        >
          <ServerServicesCard defaultType={serviceContentType} />
        </Suspense>
      </div>
    </>
  );
}
