import type { Metadata } from "next";
import { ThemeProvider } from '@/app/config/theme'
import './global.css'
import AppBar from '@/app/appbar/AppBar'

export const metadata: Metadata = {
  title: "ShannonScan",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
