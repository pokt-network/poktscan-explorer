import Logo from './poktscan_logo_dark.svg'
import Link from 'next/link'
import Price from '@/app/components/Price'
import SiteSettings from '@/app/appbar/SiteSettings'
import SearchInput from '@/app/Search/Search'
import ExplorerSelector from '@/app/appbar/ExplorerSelector'
import Status from '@/app/appbar/Status/Status'
import RoutesExpand from '@/app/appbar/RoutesExpand'
import ExpandContextProvider from '@/app/appbar/Routes/ExpandContext'
import RoutesAccordion from '@/app/appbar/Routes/RoutesAccordion'
import RoutesList from '@/app/appbar/Routes/RoutesList'

export default async function AppBar() {
  return (
    <>
      <section
        className={'min-h-[47px] px-3 lg:px-4 py-1 sticky bg-[color:--main-background] z-[1024] border-b border-[color:--divider] top-0 flex flex-row items-center justify-between'}
      >
        <div className={'w-full h-full flex items-center justify-center'}>
          <div className={'max-w-[1360px] w-full flex items-center justify-between'}>
            <div className={'hidden md:block'}>
              <Price />
            </div>
            <div className='w-full md:w-auto flex flex-row items-center gap-2 justify-end'>
              <SearchInput pathToHide={'/'} />
              <SiteSettings />
              <ExplorerSelector/>
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
              <div className={'flex items-center gap-2'}>
                <Link href={'/'} className={'decoration-none'}>
                  <Logo className={'h-7 w-auto'} />
                </Link>
                <Status />
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
