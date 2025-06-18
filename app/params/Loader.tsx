import { Skeleton } from '@/components/ui/skeleton'

const items = [
  3,
  4,
  2
]

export default function ParamsLoader() {
  return (
    <>
      <div className={'flex flex-row items-center gap-3 justify-between pr-2 flex-wrap'}>
        <h1 className={'text-lg font-medium'}>
          Parameters
        </h1>
      </div>
      {items.map((item, index) => (
        <div
          key={item.toString() + index.toString()}
          className={'bg-[color:--main-background] p-5 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow'}
        >
          <Skeleton className={'h-5'} style={{width: 50 * item}} />
          <div className={'grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4'}>
            {new Array(item).fill(null).map((_, index) => (
              <div key={index}
                   className={'flex flex-col justify-between gap-2 bg-[color:--background] p-4 rounded-lg border border-[color:--divider]'}>
                <div className={'flex flex-col gap-2'}>
                  <Skeleton className={'h-4 w-[140px]'} />
                  <Skeleton className={'h-4 w-[100px]'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
