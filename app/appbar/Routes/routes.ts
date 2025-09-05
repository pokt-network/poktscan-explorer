import type { RoutesAccordionProps } from '@/app/appbar/Routes/RoutesMenu'

const routes: RoutesAccordionProps['routeGroups'] = [
  {
    type: 'single',
    label: 'Home',
    href: '/',
  },
  {
    type: 'group',
    label: 'Dashboards',
    items: [
      {
        type: 'route',
        label: 'Services',
        href: '/dashboards/services',
      },
      {
        type: 'route',
        label: 'Gateways And Apps',
        href: '/dashboards/gateways-apps',
        disabled: true,
      },
      {
        type: 'route',
        label: 'Tokenomics',
        href: '/dashboards/tokenomics',
        disabled: true,
      },
      {
        type: 'route',
        label: 'Node Running',
        href: '/dashboards/node-running',
      },
      {
        type: 'route',
        label: 'Governance',
        href: '/dashboards/governance',
        disabled: true,
      }
    ]
  },
  {
    type: 'group',
    label: "Tools",
    items: [
      {
        type: 'route',
        label: 'Gateways and Apps',
        href: '/tools/apps-gateways',
        disabled: true,
      },
      {
        type: 'route',
        label: 'Operator',
        href: '/tools/operator'
      },
      {
        type: 'route',
        label: 'Staking',
        href: '/tools/staking'
      },
    ]
  },
  {
    type: 'group',
    label: 'Blockchain',
    items: [
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
        label: 'Validators',
        href: '/validators'
      },
      {
        type: 'route',
        label: 'Services',
        href: '/services'
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
      {
        type: 'route',
        label: 'Migration',
        href: '/migration'
      },
    ]
  },
  {
    type: 'group',
    label: 'Resources',
    items: [
      {
        type: 'route',
        label: 'Official Docs',
        href: 'https://docs.pokt.network/'
      },
      {
        type: 'route',
        label: 'Developer Docs',
        href: 'https://dev.poktroll.com/'
      },
      {
        type: 'divider',
      },
      {
        type: 'route',
        label: 'Soothe Vault',
        href: 'https://trustsoothe.io/'
      },
      {
        type: 'route',
        label: 'Keplr Wallet',
        href: 'https://www.keplr.app/get'
      },
      {
        type: 'divider',
      },
      {
        type: 'route',
        label: 'POKT Money',
        href: 'https://pokt.money/'
      },
    ]
  }
] as const

export default routes
