import Link from 'next/link'
import routes from '@/app/appbar/Routes/routes'
import PageUnderConstruction from '@/app/components/PageUnderConstruction'

const labelByPathname: Record<string, string> = {
  '/dashboards/services': 'Services',
  '/dashboards/gateways-apps': 'Gateways And Apps',
  '/dashboards/tokenomics': 'Tokenomics',
  '/dashboards/node-running': 'Node Running',
  '/dashboards/governance': 'Governance',
  '/tools/apps-gateways': 'Gateways and Apps',
  '/tools/operator': 'Operator',
  '/tools/staking': 'Staking',
  '/resources/top-statistics': 'Top Statistics',
  '/resources/knowledge-base': 'Knowledge Base',
}

export default async function NotFound({searchParams}: {searchParams?: Promise<Record<string, string | string[] | undefined>>}) {
  const paramsAwaited = searchParams ? await searchParams : {}

  let isUnderConstructionPage = false

  for (const routeGroup of routes) {
    if (routeGroup.label === 'Blockchain' || routeGroup.type === 'single') continue

    for (const route of routeGroup.items) {
      if (route.type === 'route' && route.href === paramsAwaited?.pt) {
        isUnderConstructionPage = true
        break
      }
    }
  }

  if (isUnderConstructionPage) {
    return (
      <PageUnderConstruction title={labelByPathname[paramsAwaited.pt as string] ||'Page Under Construction'} />
    )
  }

  return (
    <div className={'flex grow h-[calc(100dvh-70px-53px-55px)] flex-col pt-4 pl-6 sm:pl-10 xl:pl-4'}>
      <h1 className={'font-medium text-[8rem] leading-[140px]'}>404</h1>
      <p className={'text-[color:--secondary] font-medium text-4xl tracking-widest'}>
        Page Not Found
      </p>
      <p className={'text-[color:--secondary] tracking-wide mt-2 mb-5'}>
        The page you are looking for does not exist!
      </p>
      <Link href="/" className={'text-white w-[140px] text-center font-medium p-2 rounded-lg bg-[color:--primary-background] hover:bg-[color:--primary] transition-all'}>
        Back to home
      </Link>
    </div>
  )
}
