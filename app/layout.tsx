import type { Metadata } from "next";
import { ThemeProvider } from '@/app/config/theme'
import './global.css'
import AppBar from '@/app/appbar/AppBar'
import { ApolloWrapper } from '@/app/config/apollo/client'
import { Roboto } from 'next/font/google'
import Footer from '@/app/footer/Footer'

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
  return (
    <html lang="en" suppressHydrationWarning  className={`${roboto.variable}`}>
      <body>
        <ApolloWrapper url={process.env.GRAPHQL_API_URL}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AppBar />
            <div className={'w-full h-full flex items-center justify-center'}>
              <div className={'max-w-[1400px] w-full'}>
                {children}
              </div>
            </div>
            <Footer />
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
