import type { Metadata } from "next";
import { ThemeProvider } from '@/app/config/theme'
import './global.css'
import AppBar from '@/app/appbar/AppBar'
import { ApolloWrapper } from '@/app/config/apollo/client'
import { Roboto } from 'next/font/google'
import Footer from '@/app/footer/Footer'
import DatesProvider from '@/app/dates/Context'
import { cookies } from 'next/headers'
import { dateTimeColumnField, dateTimeZoneField, formatTextField } from '@/app/dates/constants'
import HeightContextProvider from '@/app/context/height'
import { getLatestBlock } from '@/app/api/blocks'
import ReactQueryProvider from '@/app/config/query'
import RegisterPlugins from '@/app/Charts/Plugins/RegisterPlugins'
import getMetadata from '@/app/api/metadata'

export const metadata: Metadata = {
  title: "POKTscan",
};

export const dynamic = "force-dynamic";

const roboto = Roboto({
  variable: '--font-roboto',
  // weight: ['400', '500', '600','700'],
  // display: 'swap',
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  const [
    cookiesAwaited,
    latestBlock,
    metadata,
  ] = await Promise.all([
    cookies(),
    getLatestBlock().catch(() => null),
    getMetadata().catch(() => null),
  ])

  return (
    <html lang="en" suppressHydrationWarning  className={`${roboto.variable}`}>
      <body>
        <ReactQueryProvider>
          <ApolloWrapper url={process.env.CLIENT_GRAPHQL_API_URL!}>
            <DatesProvider
              defaultDateTimeColumn={cookiesAwaited.get(dateTimeColumnField)?.value}
              defaultDateTimeZone={cookiesAwaited.get(dateTimeZoneField)?.value}
              defaultFormatText={cookiesAwaited.get(formatTextField)?.value}
            >
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                enableColorScheme
              >
                <HeightContextProvider
                  firstHeight={latestBlock?.height}
                  networkHeight={metadata?._metadata?.targetHeight || 0}
                  // the timestamp is in UTC, so we need to add the Z to the end because the api doesn't include it
                  firstTime={latestBlock?.timestamp ? latestBlock.timestamp + 'Z' : ''}
                >
                  <RegisterPlugins />
                  <AppBar />
                  <div className={'w-full h-full flex items-center justify-center overflow-x-hidden'}>
                    <div className={'max-w-[1400px] w-full'} id={'content-container'}>
                      {children}
                    </div>
                  </div>
                  <Footer />
                </HeightContextProvider>
              </ThemeProvider>
            </DatesProvider>
          </ApolloWrapper>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
