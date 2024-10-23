import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

export const metadata = {
  title: 'Researcher Pro',
  description: 'AI-driven industry research and analysis platform',
}
