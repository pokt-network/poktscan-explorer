import LineChartLoader from '@/app/(home)/LineChartLoader'

interface CardEvolutionChartProps {
  title: string

}

function CardEvolutionChart({title }: CardEvolutionChartProps) {
  return (
    <div className={'bg-[color:--main-background] pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
      <div className={'h-[41px] p-4 flex items-center border-b border-[color:--divider]'}>
        <p className={'font-semibold text-[15px]'}>
          {title}
        </p>
      </div>
      <div className={'h-[100px] px-3 py-2'}>
        <LineChartLoader />
      </div>
    </div>
  )
}

export default function EvolutionChartsLoader() {
  return (
    <div className="flex flex-col gap-y-4 w-full">
      <CardEvolutionChart title={'Supply Evolution (POKT)'} />
      <CardEvolutionChart title={'Staked Validators Evolution'} />
      <CardEvolutionChart title={'Staked Suppliers Evolution'} />
      <CardEvolutionChart title={'Staked Apps Evolution'} />
    </div>
  )
}
