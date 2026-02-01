import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import Head from 'next/head'
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

  return (
    <>
      <Head>
        <title>猫猫之家</title>
        <meta name="description" content="Web3 个人主页平台" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
