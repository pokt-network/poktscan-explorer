import routes from '@/app/appbar/Routes/routes'
import RoutesMenu from '@/app/components/RoutesMenu'

export default function RoutesList() {
  return (
    <div className={'hidden lg:flex gap-0 flex-row'}>
      {routes.map(({label, items}) => (
        <RoutesMenu
          key={label}
          label={label}
          items={items}
        />
      ))}
    </div>
  )
}
