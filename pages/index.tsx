import React, { useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      let address: string | undefined
      if (typeof window.okxwallet !== 'undefined') {
        const accounts = await window.okxwallet.request({ method: 'eth_requestAccounts' })
        address = accounts[0]
      } else if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        address = accounts[0]
      } else {
        alert('请安装 OKX Wallet 或其他支持的钱包')
        return
      }
      if (!address) {
        alert('钱包连接失败')
        return
      }
      const res = await fetch('/api/auth/siwe/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      })
      const data = await res.json()
      if (data.ok) {
        router.push('/setup')
      } else {
        alert('登录失败')
      }
    } catch (e) {
      alert('钱包连接或登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>欢迎来到 i.catcat.meme</h1>
        <p className={styles.subtitle}>用你的 Web3 钱包登录，开启个人博客</p>
        
        <div className={styles.form}>
          <button onClick={handleConnect} disabled={isLoading} className={styles.btnPrimary}>
            {isLoading ? '连接中...' : '连接钱包'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default Home