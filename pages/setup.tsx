import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import type { NextPage } from 'next'
import styles from '../styles/Setup.module.css'

const Setup: NextPage = () => {
  const [username, setUsername] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [bio, setBio] = useState('')
  const [themeId, setThemeId] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
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
        body: JSON.stringify({ twitterHandle, bio, themeId })
      })
      if (res.ok) {
        alert('设置成功！')
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
        <h1 className={styles.title}>设置你的博客</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>用户名（将作为你的博客地址）</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={styles.input} placeholder="alice" required />
          </div>
          <div className={styles.field}>
            <label>Twitter Handle（可选）</label>
            <input type="text" value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} className={styles.input} placeholder="alice" />
          </div>
          <div className={styles.field}>
            <label>个人简介（可选）</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className={styles.textarea} rows={3} placeholder="一句话介绍你自己" />
          </div>
          <div className={styles.field}>
            <label>主题风格</label>
            <select value={themeId} onChange={e => setThemeId(Number(e.target.value))} className={styles.select}>
              {Array.from({ length: 9 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>主题 {i + 1}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={isLoading} className={styles.btnPrimary}>
            {isLoading ? '保存中...' : '保存并打开博客'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default Setup