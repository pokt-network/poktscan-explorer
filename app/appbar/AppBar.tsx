import Logo from './poktscan_logo_dark.svg'
import Link from 'next/link'
import RoutesMenu from '@/app/components/RoutesMenu'
import getPrice from '@/app/api/price'
import Price from '@/app/components/Price'
import SiteSettings from '@/app/appbar/SiteSettings'
import SearchInput from '@/app/Search/Search'

export default async function AppBar() {
  const price = await getPrice();

  return (
    <>
      <section
        className={'h-[54px] px-3 lg:px-10 py-1 sticky bg-[color:--main-background] z-[1024] border-b border-[color:--divider] top-0 flex flex-row items-center justify-between'}
      >
        <div className={'w-full h-full flex items-center justify-center'}>
          <div className={'max-w-[1320px] w-full flex items-center justify-between'}>
            <div className={'hidden md:block'}>
              <Price {...price} />
            </div>
            <div className='w-full md:w-auto flex flex-row items-center gap-2'>
              <SearchInput pathToHide={'/'} />
              <SiteSettings />
            </div>

          </div>
        </div>
      </section>
      <header
        className={'h-[61px] px-3 lg:px-10 bg-[color:--main-background] border-b border-[color:--divider] flex flex-row items-center justify-between'}>
        <div className={'w-full h-full flex items-center justify-center'}>
          <div className={'max-w-[1320px] w-full flex items-center justify-between'}>
            <Link href={'/'} className={'decoration-none'}>
              <Logo className={'h-7 w-auto'} />
            </Link>
            <RoutesMenu
              label={'Blockchain'}
              items={[
                {
                  type: 'route',
                  label: 'Transactions',
                  href: '/txs'
                },
                {
                  type: 'route',
                  label: 'Suppliers',
                  href: '/suppliers'
                },
                {
                  type: 'route',
                  label: 'Accounts',
                  href: '/accounts'
                },
                {
                  type: 'route',
                  label: 'Applications',
                  href: '/apps'
                },
                {
                  type: 'route',
                  label: 'Gateways',
                  href: '/gateways'
                },
                {
                  type: 'route',
                  label: 'Blocks',
                  href: '/blocks'
                },
                {
                  type: 'route',
                  label: 'Parameters',
                  href: '/params'
                },
              ]}
            />

          </div>
        </div>
      </header>
    </>
)
}
