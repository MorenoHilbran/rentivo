import './globals.css'
import Script from 'next/script'
import { Bodoni_Moda, Geist, Instrument_Serif } from 'next/font/google'
import { ToastProvider } from '@/components/ToastProvider'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument-serif',
  display: 'swap',
})

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: 'italic',
  variable: '--font-bodoni-moda',
  display: 'swap',
})

export const metadata = {
  title: {
    template: '%s | Rentivo',
    default: 'Rentivo — CRM Bisnis Rental',
  },
  description: 'Platform AI-assisted omnichannel CRM untuk bisnis rental/persewaan barang berbasis jadwal.',
  keywords: ['rental', 'CRM', 'bisnis rental', 'manajemen penyewaan', 'Rentivo'],
  icons: {
    icon: [
      {
        url: '/icon.png',
        type: 'image/png',
        sizes: '1254x1254',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        type: 'image/png',
        sizes: '1254x1254',
      },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geist.variable} ${instrumentSerif.variable} ${bodoniModa.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Script id="strip-browser-extension-attrs" strategy="beforeInteractive">
          {`(() => {
            try {
              const scrub = (root) => {
                const nodes = [root, ...root.querySelectorAll('*')]
                for (const node of nodes) {
                  for (const attr of Array.from(node.attributes || [])) {
                    if (attr.name.startsWith('bis_') || attr.name.startsWith('__processed_')) {
                      node.removeAttribute(attr.name)
                    }
                  }
                }
              }
              scrub(document.documentElement)
              new MutationObserver(() => scrub(document.documentElement)).observe(document.documentElement, {
                subtree: true,
                childList: true,
              })
            } catch {}
          })();`}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
