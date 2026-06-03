import './globals.css'
import Script from 'next/script'
import { ToastProvider } from '@/components/ToastProvider'

export const metadata = {
  title: {
    template: '%s | Rentivo',
    default: 'Rentivo — CRM Bisnis Rental',
  },
  description: 'Platform AI-assisted omnichannel CRM untuk bisnis rental/persewaan barang berbasis jadwal.',
  keywords: ['rental', 'CRM', 'bisnis rental', 'manajemen penyewaan', 'Rentivo'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth">
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
