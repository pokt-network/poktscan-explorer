import { unstable_cache } from 'next/cache'

export interface Price {
  usd: number
  usd_market_cap: number
  usd_24h_change: number
}

const getPrice = unstable_cache(async (): Promise<Price> => {
  const data = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=pocket-network&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
    {
      next: {revalidate: 60}
    })
    .then((res) => res.json())

  return data['pocket-network'];
},
['price'],
{
    revalidate: 60
})

export default getPrice;
