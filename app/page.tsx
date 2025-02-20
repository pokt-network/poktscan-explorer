import type { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import type { Block } from '@/app/config/gql/graphql'
import getPrice from '@/app/api/price'
import SearchInput from '@/app/Search/Search'
import { getClient } from '@/app/config/apollo/rsc'
import { getEvolutionVariables, getServicesVariables, getSummaryVariables } from '@/app/(home)/utils'
import SupplierAndAppsEvolution from '@/app/(home)/SupplierAndAppsEvolution/SupplierAndAppsEvolution'
import ServicesCard from '@/app/(home)/ServicesCard'
import { getLatestBlock } from '@/app/api/blocks'
// import SponsoredLabel from '@/app/components/SponsoredLabel'
import LatestBlock from '@/app/(home)/LatestBlock'
import { evolutionDocument, servicesDocument, summaryDocument } from '@/app/(home)/operations'
import Summary from '@/app/(home)/Summary'

export const dynamic = "force-dynamic";

export default async function Home({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const [search, latestBlock] = await Promise.all([
    searchParams,
    getLatestBlock()
  ])

  const currentDate = new Date(latestBlock.timestamp)
  const serviceContentType = search['dashboard_services_card']?.toString() || 'chart'

  const client = getClient()

  const [price, { data }, {data: supplierAndAppsEvolutionData }, { data: servicesData }] = await Promise.all([
    getPrice(),
    client.query({
      query: summaryDocument,
      variables: getSummaryVariables(currentDate),
    }),
    client.query({
      query: evolutionDocument,
      variables: getEvolutionVariables(currentDate)
    }),
    client.query({
      query: servicesDocument,
      variables: getServicesVariables(currentDate)
    }),
  ])

  return (
    <>
      <section
        className='pt-7 relative md:pt-[56px] pb-[95px] px-4 md:px-5'
      >
        <h1 className='text-white text-lg font-bold leading-[24px] mb-3'>
          The Pocket Network Shannon Explorer
        </h1>
        <div className={'absolute z-[-1] w-[100vw] left-[calc((50%-50vw))] top-0 right-0 h-full bg-[color:#081d35] dark:bg-[color:rgb(10,10,10)]'}
             style={{ backgroundImage: 'url(/waves-light.svg)' }}
        />
        <div className={'w-full md:w-[480px] lg:w-[580px] mb-[12px]'}>
          <SearchInput zIndex={1} height={48} />
        </div>
        {/*<SponsoredLabel />*/}
      </section>
      <div className={'px-4 md:px-5 pb-4 mt-[-46px]'}>
        <Summary initialData={data as DocumentNodeData<typeof summaryDocument>} price={price} />
      </div>

      <div className={'px-4 md:px-5 pb-10 flex lg:flex-row flex-col gap-4'}>
        <div className={'w-full lg:w-[50%] flex flex-col gap-4'}>
          <LatestBlock initialData={latestBlock as Required<Block>} />
          <SupplierAndAppsEvolution initialData={supplierAndAppsEvolutionData} />
        </div>
        <ServicesCard
          initialData={servicesData as DocumentNodeData<typeof servicesDocument>}
          defaultType={serviceContentType}
        />
      </div>
    </>
  );
}
