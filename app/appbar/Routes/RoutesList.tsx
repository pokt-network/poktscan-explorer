import routes from '@/app/appbar/Routes/routes'
import RoutesMenu, { RouteSingle } from '@/app/appbar/Routes/RoutesMenu'

export default function RoutesList() {
  return (
    <div className={'hidden lg:flex gap-0 flex-row'}>
      {routes.map((item) => {
        if (item.type === 'single') {
          return (
            <RouteSingle
              label={item.label}
              key={item.href}
              href={item.href}
            />
          )
        } else {
          return (
            <RoutesMenu
              key={item.label}
              label={item.label}
              items={item.items}
            />
          )
        }
      })}
    </div>
  )
}
