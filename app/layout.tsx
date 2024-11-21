import type { Metadata } from "next";
import { ThemeProvider } from '@/app/config/theme'
import './global.css'
import AppBar from '@/app/appbar/AppBar'
import { ApolloWrapper } from '@/app/config/apollo/client'

export const metadata: Metadata = {
  title: "ShannonScan",
};

export default async function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
