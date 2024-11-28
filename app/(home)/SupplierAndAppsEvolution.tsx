import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import CommonLineChart, { CommonLineChartProps } from '@/app/(home)/CommonLineChart'

const evolutionDocument = graphql(`
  query supplierAndAppsEvolution(
    $currentDate: Datetime!,
    $yesterdayDate: Datetime!
    $previous2Date: Datetime!
    $previous3Date: Datetime!
    $previous4Date: Datetime!
    $previous5Date: Datetime!
    $previous6Date: Datetime!
  ) {
    today: blocks(filter: {timestamp: {greaterThanOrEqualTo: $currentDate }}, orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    yesterday: blocks(filter: {timestamp: {greaterThanOrEqualTo: $yesterdayDate, lessThan: $currentDate }}, orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last2: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous2Date, lessThan: $yesterdayDate}}, orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last3: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous3Date, lessThan: $previous2Date}}, orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last4: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous4Date, lessThan: $previous3Date}}, orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last5: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous5Date, lessThan: $previous4Date}}, orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last6: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous6Date, lessThan: $previous5Date}}, orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
  }
`)

function get24hoursBefore(date: Date) {
  return new Date(date.getTime() - 24 * 60 * 60 * 1000)
}

interface SupplierAndAppsEvolutionProps {
  currentDate: Date
}

export default async function SupplierAndAppsEvolution({
  currentDate: currentDateFromProps
}: SupplierAndAppsEvolutionProps) {
  const currentDate =  new Date(currentDateFromProps.getTime())
  currentDate.setUTCHours(0, 0, 0, 0)
  const yesterdayDate = get24hoursBefore(currentDate)
  const previous2Date = get24hoursBefore(yesterdayDate)
  const previous3Date = get24hoursBefore(previous2Date)
  const previous4Date = get24hoursBefore(previous3Date)
  const previous5Date = get24hoursBefore(previous4Date)
  const previous6Date = get24hoursBefore(previous5Date)

  const {data} = await getClient().query({
    query: evolutionDocument,
    variables: {
      currentDate: currentDate.toISOString(),
      yesterdayDate: yesterdayDate.toISOString(),
      previous2Date: previous2Date.toISOString(),
      previous3Date: previous3Date.toISOString(),
      previous4Date: previous4Date.toISOString(),
      previous5Date: previous5Date.toISOString(),
      previous6Date: previous6Date.toISOString(),
    }
  })

  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" });

  const supplierData: CommonLineChartProps['data'] = [
    {
      label: dateFormatter.format(currentDate),
      value: data.today?.nodes?.at(0)?.stakedSuppliers || 0
    },
    {
      label: dateFormatter.format(yesterdayDate),
      value: data.yesterday?.nodes?.at(0)?.stakedSuppliers || 0
    },
    {
      label: dateFormatter.format(previous2Date),
      value: data.last2?.nodes?.at(0)?.stakedSuppliers || 0
    },
    {
      label: dateFormatter.format(previous3Date),
      value: data.last3?.nodes?.at(0)?.stakedSuppliers || 0
    },
    {
      label: dateFormatter.format(previous4Date),
      value: data.last4?.nodes?.at(0)?.stakedSuppliers || 0
    },
    {
      label: dateFormatter.format(previous5Date),
      value: data.last5?.nodes?.at(0)?.stakedSuppliers || 0
    },
    {
      label: dateFormatter.format(previous6Date),
      value: data.last6?.nodes?.at(0)?.stakedSuppliers || 0
    },
  ].reverse()

  const appsData: CommonLineChartProps['data'] = [
    {
      label: dateFormatter.format(currentDate),
      value: data.today?.nodes?.at(0)?.stakedApps || 0
    },
    {
      label: dateFormatter.format(yesterdayDate),
      value: data.yesterday?.nodes?.at(0)?.stakedApps || 0
    },
    {
      label: dateFormatter.format(previous2Date),
      value: data.last2?.nodes?.at(0)?.stakedApps || 0
    },
    {
      label: dateFormatter.format(previous3Date),
      value: data.last3?.nodes?.at(0)?.stakedApps || 0
    },
    {
      label: dateFormatter.format(previous4Date),
      value: data.last4?.nodes?.at(0)?.stakedApps || 0
    },
    {
      label: dateFormatter.format(previous5Date),
      value: data.last5?.nodes?.at(0)?.stakedApps || 0
    },
    {
      label: dateFormatter.format(previous6Date),
      value: data.last6?.nodes?.at(0)?.stakedApps || 0
    },
  ].reverse()

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className={'bg-[color:--main-background] pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
        <div className={'h-[50px] p-4 flex items-center border-b border-[color:--divider]'}>
          <p className={'font-semibold text-[15px]'}>
            Staked Suppliers Evolution
          </p>
        </div>
        <CommonLineChart data={supplierData} dataLabel={'Staked Suppliers'} />
      </div>
      <div className={'bg-[color:--main-background] pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
        <div className={'h-[50px] p-4 flex items-center border-b border-[color:--divider]'}>
          <p className={'font-semibold text-[15px]'}>
            Staked Apps Evolution
          </p>
        </div>
        <CommonLineChart data={appsData} dataLabel={'Staked Apps'} />
      </div>
    </div>
  )
}
