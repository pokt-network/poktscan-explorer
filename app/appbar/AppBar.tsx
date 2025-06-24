import Logo from './poktscan_logo_dark.svg'
import Link from 'next/link'
import Price from '@/app/components/Price'
import SiteSettings from '@/app/appbar/SiteSettings'
import SearchInput from '@/app/Search/Search'
import ExplorerSelector from '@/app/appbar/ExplorerSelector'
import Status from '@/app/appbar/Status/Status'
import RoutesExpand from '@/app/appbar/Routes/RoutesExpand'
import ExpandContextProvider from '@/app/appbar/Routes/ExpandContext'
import RoutesAccordion from '@/app/appbar/Routes/RoutesAccordion'
import RoutesList from '@/app/appbar/Routes/RoutesList'

const rpcUrl = process.env.RPC_BASE_URL!

export default async function AppBar() {
  const siteSettings = (
    <SiteSettings />
  )
  return (
    <>
      <section
        className={'min-h-[47px] px-3 lg:px-4 py-1 sticky bg-[color:--main-background] z-[1023] border-b border-[color:--divider] top-0 flex flex-row items-center justify-between'}
      >
        <div className={'w-full h-full flex items-center justify-center'}>
          <div className={'max-w-[1360px] w-full flex lg:items-center pt-1 lg:pt-0 lg:justify-between gap-1 lg:gap-2 flex-col lg:flex-row'}>
            <div className={'flex items-center gap-2 justify-between'}>
              <div className={'flex items-center gap-2'}>
                <Status />
                <div
                  className={'flex items-center justify-center px-2 py-1 rounded-sm border dark:border-2 gap-1 border-[color:--divider]'}
                >
                  <Price />
                </div>
              </div>
              <div className={'block lg:hidden'}>
                {siteSettings}
              </div>
            </div>

            <div className='w-full flex flex-row items-center gap-2 justify-end'>
              <div className='w-full lg:w-auto'>
                <SearchInput pathToHide={'/'} rpcUrl={rpcUrl} />
              </div>
              <div className={'hidden lg:block'}>
                {siteSettings}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ExpandContextProvider>
      <header
        className={'m-h-[55px] px-3 lg:px-4 bg-[color:--main-background] border-b border-[color:--divider]'}>
        <div className={'h-[55px] flex flex-row items-center justify-between'}>
          <div className={'w-full h-full flex items-center justify-center'}>
            <div className={'max-w-[1360px] w-full flex items-center justify-between'}>
              <div className={'flex items-center gap-2 relative'}>
                <Link href={'/'} className={'decoration-none'}>
                  <Logo className={'h-8 w-auto'} />
                </Link>
                <ExplorerSelector />
              </div>
              <RoutesList/>
              <RoutesExpand />
            </div>
          </div>
        </div>
        <RoutesAccordion/>
      </header>
      </ExpandContextProvider>
    </>
)
}
