import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import type { NextPage } from 'next'
import styles from '../styles/Setup.module.css'

const Setup: NextPage = () => {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if logged in (cookie)
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (!data.loggedIn) router.push('/')
      })
      .catch(() => router.push('/'))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) {
      alert('请设置用户名')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/${username}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      if (res.ok) {
        router.push(`/${username}`)
      } else {
        alert('保存失败')
      }
    } catch (e) {
      alert('网络错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>欢迎来到猫猫之家</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>用户名（将作为你的博客地址）</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={styles.input} placeholder="alice" required />
          </div>
          <button type="submit" disabled={isLoading} className={styles.btnPrimary}>
            {isLoading ? '保存中...' : '打开博客'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default Setup