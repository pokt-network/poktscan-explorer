import ServiceCardContent from '@/app/(home)/Services/ServiceCardContent'
import BaseTable from '@/app/components/BaseTable'
import { columns } from '@/app/(home)/Services/ServicesTable'
import { Skeleton } from '@/components/ui/skeleton'

function GainersLoader() {
  const items = new Array(5).fill(null)
  return items.map((_, index) => (
    <div
      key={index}
      className={`flex h-[37px] items-center justify-between gap-2 p-2 ${index !== items.length - 1 ? 'border-b' : ''} border-[color:--divider]`}
    >
      <Skeleton className={'w-full max-w-[160px] h-5'} />
      <Skeleton className={'w-[60px] h-5'} />
    </div>
  ))
}

function ChartLoader() {
  return (
    <div className={'flex flex-col gap-6 sm:gap-0 sm:h-[600px] w-full items-center justify-center px-4 xl:px-10'}>
      <div className={'flex flex-col sm:flex-row w-full items-center justify-center sm:gap-6'}>
        <div
          className={`relative h-[280px] lg:h-[340px] w-full sm:w-[300px] lg:w-[60%] xl:w-[50%] justify-center items-center flex after:absolute after:pt-2 after:content-['Computed_Units'] after:flex after:items-center after:justify-center after:w-[100px] after:pr-2 after:text-center`}
        >
          <div
            className={`-mt-3 sm:mt-0 relative h-[220px] w-[220px] xl:h-[260px] xl:w-[260px] justify-center items-center flex after:absolute after:pt-2 after:content-['Computed_Units'] after:flex after:items-center after:justify-center after:w-[100px] after:pr-2 after:text-center`}
          >
            <Skeleton className={'w-full h-full rounded-full'} />
            <div className={'absolute w-[160px] h-[160px] xl:w-[200px] xl:h-[200px] bg-[color:--main-background] rounded-full z-[1]'} />
          </div>
        </div>
        <div id={'legends-container'} className={'mt-0 sm:mt-0 lg:ml-0 md:ml-4 xl:ml-6 flex flex-col grow gap-3 max-w-[220px] lg:max-w-[150px] w-full sm:max-w-[220px] lg:w-[40%] xl:w-[50%]'}>
          {Array.from({length: 5}).map((_, index) => (
            <Skeleton
              key={index}
              className={'w-[220px] lg:w-[150px] h-7 rounded-lg'}
            />
          ))}
        </div>
      </div>

      <div className={'flex flex-col sm:flex-row gap-4 w-full lg:-mb-6 xl:mb-0 lg:mt-6 xl:-mt-4'}>
        <div className={'flex flex-col border border-[color:--divider] rounded-md w-full'}>
          <div className={'border-b border-[color:--divider] w-full h-[40px] items-center flex px-2'}>
            <p className={'text-sm font-bold'}>Biggest Gainers</p>
          </div>
          <GainersLoader />
        </div>
        <div className={'flex flex-col border border-[color:--divider] rounded-md w-full'}>
          <div className={'border-b border-[color:--divider] w-full h-[40px] items-center flex px-2'}>
            <p className={'text-sm font-bold'}>Best Performance</p>
          </div>
          <GainersLoader />
        </div>
      </div>
    </div>
  )
}

interface ServicesLoaderProps {
  defaultType: string
}

export default function ServicesLoader({defaultType}: ServicesLoaderProps) {
  return (
    <ServiceCardContent
      disableSelect={true}
      defaultType={defaultType}
      hasItems={true}
      chart={(
        <ChartLoader />
      )}
      table={
        <div className={'overflow-auto flex sm:h-[600px]'}>
          <BaseTable columns={columns} rows={[]} isLoading={true} skeletonRows={20} />
        </div>
      }
    />
  )
}
