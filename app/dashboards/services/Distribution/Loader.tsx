import Card from '@/app/dashboards/services/Distribution/Card'
import { Skeleton } from '@/components/ui/skeleton'

interface LoaderProps {
  timeSelected: string
}

export function ContentLoader() {
  return (
    <div className={'flex flex-col sm:flex-row w-full items-center justify-center sm:gap-10'}>
      <div
        className={`mt-10 sm:mt-0 relative h-[220px] w-[220px] justify-center items-center flex after:absolute after:pt-2 after:content-['Computed_Units'] after:flex after:items-center after:justify-center after:w-[100px] after:pr-2 after:text-center`}
      >
        <Skeleton className={'w-full h-full rounded-full'} />
        <div className={'absolute w-[160px] h-[160px] bg-[color:--main-background] rounded-full z-[1]'} />
      </div>
      <div id={'legends-container'} className={'mt-10 sm:mt-0 lg:ml-10 xl:ml-6 flex flex-col grow gap-3 max-w-[220px] lg:max-w-[150px] w-full sm:max-w-[220px] lg:w-[40%] xl:w-[50%]'}>
        {Array.from({length: 4}).map((_, index) => (
          <Skeleton
            key={index}
            className={'w-[220px] lg:w-[150px] h-7 rounded-lg'}
          />
        ))}
      </div>
    </div>
  )
}

export default function Loader({timeSelected}: LoaderProps) {
  return (
    <Card timeSelected={timeSelected}>
      <ContentLoader />
    </Card>
  )
}
