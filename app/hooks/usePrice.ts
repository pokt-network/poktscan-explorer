'use client'

import {useQuery} from '@tanstack/react-query'
import { fetchPrice, Price } from '@/app/api/price'

export default function usePrice(): { data: Price, isLoading: boolean, isError: boolean } {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["price"],
    queryFn: fetchPrice,
    refetchInterval: 60000, // Fetch every minute
  });

  return { data: data! || {}, isError, isLoading }
}
