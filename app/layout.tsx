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

export const metadata: Metadata = {
  title: "ShannonScan",
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
  const cookiesAwaited = await cookies()



  return (
    <html lang="en" suppressHydrationWarning  className={`${roboto.variable}`}>
      <body>
        <ApolloWrapper url={process.env.GRAPHQL_API_URL}>
          <DatesProvider
            defaultDateTimeColumn={cookiesAwaited.get(dateTimeColumnField)?.value}
            defaultDateTimeZone={cookiesAwaited.get(dateTimeZoneField)?.value}
            defaultFormatText={cookiesAwaited.get(formatTextField)?.value}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <AppBar />
              <div className={'w-full h-full flex items-center justify-center overflow-x-hidden'}>
                <div className={'max-w-[1400px] w-full'}>
                  {children}
                </div>
              </div>
              <Footer />
            </ThemeProvider>
          </DatesProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
