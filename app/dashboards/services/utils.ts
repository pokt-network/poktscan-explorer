import { Time } from '@/app/dashboards/services/constants'

export function getTimeBoxLabel(time: string) {
  let timeToUse = Time.Last30d

  if (time && Object.values(Time).includes(time as Time)) {
    timeToUse = time as Time
  }

  switch (timeToUse) {
    case Time.Last24h: {
      return '24H'
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
