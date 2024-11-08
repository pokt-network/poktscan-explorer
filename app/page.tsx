import Price from '@/app/components/Price'
import getPrice from '@/app/api/price'

export default async function Home() {
  const price = await getPrice()

  return (
    <div className={"p-10"}>
      <div className={"bg-[color:--main-background] gap-y-[20px] p-5 min-h-[180px] rounded-lg border border-[color:--divider] grid md:grid-cols-2 lg:grid-cols-3"}>

        <div className={'flex flex-col gap-y-5 pr-5'}>
          <div className={'flex grow flex-col gap-2 h-full'}>
            <p>
              POKT Price
            </p>
            <Price usd={price.usd} usd_24h_change={price.usd_24h_change} usd_market_cap={price.usd_market_cap} showLabel={false} priceColor={'--foreground'}  />
          </div>
          <hr className={'border-[color:--divider]'} />
          <div className={'flex grow flex-col gap-2 h-full'}>
            <p>
              Market Cap
            </p>
            <p className={'text-xs text-[color:--secondary]'}>
              ${Number(price.usd_market_cap.toFixed(2)).toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className={'flex flex-col gap-y-5 border-t md:pt-0 pt-5 md:border-t-0 md:px-5 md:border-l border-[color:--divider]'}>
          <div className={'flex grow'}>
            <p>
              Transactions
            </p>
          </div>
          <hr className={"border-[color:--divider]"}/>
          <div className={'flex grow'}>
            <p>
              Last Finalized Block
            </p>
          </div>
        </div>

        <div className={'flex md:col-span-2 lg:col-span-1 flex-col border-t lg:pt-0 pt-5 lg:border-t-0 gap-y-2.5 lg:pl-5 lg:border-l border-[color:--divider]'}>
          <div className={'flex grow'}>
            <p>
              Relays History Last 7 Days
            </p>
          </div>
        </div>



      </div>
    </div>
  );
}
