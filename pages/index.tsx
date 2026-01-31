import React, { useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!walletAddress) {
      alert('请输入钱包地址')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/siwe/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      })
      const data = await res.json()
      if (data.ok) {
        alert('登录成功！请设置你的用户名')
        router.push('/setup')
      } else {
        alert('登录失败')
      }
    } catch (e) {
      alert('网络错误')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOKX = async () => {
    if (typeof window.okxwallet !== 'undefined') {
      try {
        const accounts = await window.okxwallet.request({ method: 'eth_requestAccounts' })
        setWalletAddress(accounts[0])
      } catch (e) {
        alert('钱包连接失败')
      }
    } else if (typeof window.ethereum !== 'undefined') {
      // fallback to any ethereum provider
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setWalletAddress(accounts[0])
      } catch (e) {
        alert('钱包连接失败')
      }
    } else {
      alert('请安装 OKX Wallet 或其他支持的钱包')
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>欢迎来到 i.catcat.meme</h1>
        <p className={styles.subtitle}>用你的 Web3 钱包登录，开启个人博客</p>
        
        <div className={styles.form}>
          <input
            type="text"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleOKX} className={styles.btnSecondary}>连接钱包</button>
          <button onClick={handleLogin} disabled={isLoading} className={styles.btnPrimary}>
            {isLoading ? '登录中...' : '登录'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default Home