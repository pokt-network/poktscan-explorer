'use client'

import SearchInput from '@/app/Search/Search'
import EvolutionCharts from '@/app/(home)/EvolutionCharts/LazyEvolutionCharts'
import ServicesCard from '@/app/(home)/Services/ServicesCard'
import CustomizableCompUnits from '@/app/(home)/CustomizableCompUnitsChart'
import Summary from '@/app/(home)/Summary'

export default function Home({
  searchParams,
  rpcUrl,
  computedUnitsSelectedTime,
  computedUnitsChartType
}: {
  searchParams: Record<string, string | string[] | undefined>
  rpcUrl: string
  computedUnitsSelectedTime?: string
  computedUnitsChartType?: string
}) {
  const serviceContentType = searchParams['dashboard_services_card']?.toString() || 'chart'

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
        <Summary
          initialData={null}
          initialError={false}
        />
      </div>

      <div className={'px-4 md:px-5 pb-4'}>
        <CustomizableCompUnits
          chartType={computedUnitsChartType}
          cookieTime={computedUnitsSelectedTime}
        />
      </div>

      <div className={'px-4 md:px-5 pb-10 flex lg:flex-row flex-col gap-4'}>
        <div className={'w-full lg:w-[50%] flex flex-col gap-4 h-[652px]'}>
          <EvolutionCharts
            initialData={null}
            initialError={false}
          />
        </div>
        <ServicesCard
          defaultType={serviceContentType}
          initialData={null}
          initialError={false}
        />
      </div>
    </>
  );
}
