import type { Metadata, Viewport } from "next"
import "@fontsource-variable/big-shoulders-display"
import "@fontsource-variable/hanken-grotesk"
import "@fontsource-variable/archivo/wdth.css"
import "@fontsource-variable/cormorant-garamond"
import "@fontsource-variable/bricolage-grotesque/wdth.css"
import "@fontsource-variable/literata"

import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Wendrowan, van do wynajęcia. Cel wpisujesz sam",
  description: "Van z podnoszonym dachem do wynajęcia, z odbiorem w Oleśnicy lub we Wrocławiu. Sprawdź terminy i wyślij zapytanie.",
}

export const viewport: Viewport = { themeColor: "#0f1f10" }

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className="h-full antialiased" style={{ scrollBehavior: "smooth" }}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  )
}
