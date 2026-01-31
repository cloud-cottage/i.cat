import type { GetServerSideProps, NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { db } from '../lib/db'

type LinkItem = { label: string; url: string }

type Props = {
  user: any
  links: LinkItem[]
}

const UserBlog: NextPage<Props> = ({ user, links }) => {
  const [themeId, setThemeId] = useState(user?.themeId ?? 1)
  const [isEditing, setIsEditing] = useState(false)
  const [twitterHandle, setTwitterHandle] = useState(user?.twitterHandle ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')

  useEffect(() => {
    // hydrate web components data
    const el = document.querySelector('lc-link-list') as any
    if (el) {
      el.data = links
    }
    // set default theme
    document.body.classList.remove(...Array.from({length:9}, (_,i)=>`theme-${i+1}`))
    document.body.classList.add(`theme-${themeId}`)
  }, [links, themeId])

  const handleThemeChange = async (newThemeId: number) => {
    setThemeId(newThemeId)
    try {
      await fetch(`/api/users/${user.username}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: newThemeId })
      })
    } catch {}
  }

  const handleSaveProfile = async () => {
    try {
      await fetch(`/api/users/${user.username}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitterHandle, bio })
      })
      setIsEditing(false)
    } catch {}
  }
  return (
    <div className={`container`}> 
      <div className={`card`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{user?.username ?? 'User'}</h2>
            <p className="muted">Twitter: @{user?.twitterHandle || '未设置'}</p>
          </div>
          <select value={themeId} onChange={e => handleThemeChange(Number(e.target.value))} style={{ padding: '0.25rem 0.5rem' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>主题 {i + 1}</option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: '1rem' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="text" value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} placeholder="Twitter handle" />
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="个人简介" rows={2} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSaveProfile}>保存</button>
                <button onClick={() => setIsEditing(false)}>取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)}>编辑资料</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>外部链接</h3>
        { React.createElement('lc-link-list', { data: links }, null) }
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>推文</h3>
        { React.createElement('tw-tweet-widget', null, null) }
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.params as { username: string }
  // Load user and links from the in-memory db via exported module
  // If user not found, create a placeholder to render MVP
  let user = db.getUserByUsername(username)
  if (!user) {
    user = {
      id: 'temp-id',
      walletAddress: '0x0',
      username,
      twitterHandle: '',
      themeId: 1,
      avatarUrl: '',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
  const currentLinks = db.getLinks(user.id) ?? []
  const links = currentLinks.map((l: any) => ({ label: l.label, url: l.url }))
  return {
    props: {
      user,
      links
    }
  }
}

export default UserBlog
