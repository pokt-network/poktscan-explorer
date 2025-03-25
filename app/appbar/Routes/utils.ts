import routes from '@/app/appbar/Routes/routes'

export function getLabelOfRouteIsActive({label, href, pathname}: {label: string, pathname: string, href?: string}) {

  let isActive = false

  for (const route of routes) {
    if (route.type === 'single') {
      if (label === route.label && route.href === pathname) {
        isActive = true
        break
      }
      continue
    }

    // href is not provided for groups
    if (route.label === label && !href) {
      const someChildIsActive = route.items.find(item => item.type === 'route' && item.href === pathname)
      if (someChildIsActive) {
        isActive = true
        break
      }
    } else if (href) {
      isActive = route.items.some(item => item.type === 'route' && item.href === href && href === pathname)
      if (isActive) {
        break
      }
    }
  }

  return isActive
}
