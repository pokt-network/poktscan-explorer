import Logo from './poktscan_logo_dark.svg'
import Link from 'next/link'
import RoutesMenu from '@/app/components/RoutesMenu'
import getPrice from '@/app/api/price'
import Price from '@/app/components/Price'
import SiteSettings from '@/app/appbar/SiteSettings'



export default async function AppBar() {
  const price = await getPrice();

  return (
    <>
      <section
        className={"h-[54px] px-10 py-1 sticky bg-[color:--main-background] z-[1024] border-b border-[color:--divider] top-0 flex flex-row items-center justify-between"}
      >
        <Price {...price} />
        <SiteSettings />
      </section>
      <header className={"h-[61px] px-10 bg-[color:--main-background] border-b border-[color:--divider] flex flex-row items-center justify-between"}>
        <Link href={"/"} className={"decoration-none"}>
          <Logo className={"h-8 w-auto"} />
        </Link>
        <RoutesMenu
          label={'Blockchain'}
          items={[
            {
              type: 'route',
              label: 'Blocks',
              href: '/blocks'
            }
          ]}
        />
      </header>
    </>
  )
}
