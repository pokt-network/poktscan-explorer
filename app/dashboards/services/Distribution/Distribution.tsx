import React from 'react'
import DistributionChart from '@/app/dashboards/services/Distribution/Chart'
import Card from '@/app/dashboards/services/Distribution/Card'
import DistributionCardActions from '@/app/dashboards/services/Distribution/CardActions'
import DataProvider from '@/app/context/DataContext'

interface DistributionProps {
  timeSelected: string
}

export default function Distribution({timeSelected}: DistributionProps) {
  return (
    <DataProvider initialData={[]}>
      <Card
        timeSelected={timeSelected}
        actions={(
          <DistributionCardActions />
        )}
      >
        <DistributionChart initialData={null} initialError={false} timeSelected={timeSelected} />
      </Card>
    </DataProvider>
  )
}
