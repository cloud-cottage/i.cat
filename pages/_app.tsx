import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  // Dynamically load web components for LinkList, ThemeSwitcher, TweetWidget
  useEffect(() => {
    // Lazy load web components only on client
    import('../src/webcomponents/LinkListComponent')
      .catch(() => {
        // swallow load errors in MVP
      })
    import('../src/webcomponents/ThemeSwitcherComponent')
      .catch(() => {})
    import('../src/webcomponents/TweetWidgetComponent')
      .catch(() => {})
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
