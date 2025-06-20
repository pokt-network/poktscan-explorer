import { Time } from '@/app/dashboards/services/constants'

export function getTimeBoxLabel(time: string) {
  let timeToUse = Time.Last7d

  if (time && (Object.values(Time).includes(time as Time) || time === 'last48h')) {
    timeToUse = time as Time
  }

  switch (timeToUse) {
    case Time.Last24h: {
      return '24H'
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    case "last48h": {
      return '48H'
    }
    case Time.Last7d: {
      return '7D'
    }
    case Time.Last30d: {
      return '30D'
    }
    case Time.Last90d: {
      return '90D'
    }
  }
}
