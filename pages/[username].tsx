import type { GetServerSideProps, NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { db } from '../lib/db'

type LinkItem = { id?: string; label: string; url: string }

type Props = {
  user: any
  links: LinkItem[]
}

const UserBlog: NextPage<Props> = ({ user: initialUser, links: initialLinks }) => {
  const [themeId, setThemeId] = useState(initialUser?.themeId ?? 1)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingLinks, setIsEditingLinks] = useState(false)
  const [twitterHandle, setTwitterHandle] = useState(initialUser?.twitterHandle ?? '')
  const [bio, setBio] = useState(initialUser?.bio ?? '')
  const [links, setLinks] = useState<LinkItem[]>(initialLinks)
  const [newLink, setNewLink] = useState({ label: '', url: '' })

  useEffect(() => {
    document.body.classList.remove(...Array.from({length:9}, (_,i)=>`theme-${i+1}`))
    document.body.classList.add(`theme-${themeId}`)
  }, [themeId, links])

  const handleThemeChange = async (newThemeId: number) => {
    setThemeId(newThemeId)
    try {
      await fetch(`/api/users/${initialUser.username}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: newThemeId })
      })
    } catch (e) {
      console.error('Theme change error:', e)
    }
  }

  const handleSaveProfile = async () => {
    try {
      await fetch(`/api/users/${initialUser.username}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitterHandle, bio })
      })
      setIsEditingProfile(false)
    } catch (e) {
      console.error('Profile save error:', e)
      alert('保存失败')
    }
  }

  const handleAddLink = async () => {
    console.log('Adding link:', newLink)
    if (!newLink.label || !newLink.url) {
      alert('请填写链接名称和地址')
      return
    }
    if (links.length >= 9) {
      alert('最多只能添加 9 条链接')
      return
    }
    try {
      console.log('Fetching:', `/api/users/${initialUser.username}/links`)
      const res = await fetch(`/api/users/${initialUser.username}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      })
      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Response data:', data)
      if (data.link) {
        setLinks([...links, { id: data.link.id, label: data.link.label, url: data.link.url }])
        setNewLink({ label: '', url: '' })
        alert('链接添加成功')
      } else {
        alert('添加失败: ' + (data.error || '未知错误'))
      }
    } catch (e) {
      console.error('Add link error:', e)
      alert('网络错误，请检查控制台')
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      await fetch(`/api/users/${initialUser.username}/links/${linkId}`, {
        method: 'DELETE'
      })
      setLinks(links.filter(l => l.id !== linkId))
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  const handleMoveLink = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === links.length - 1) return
    
    const newLinks = [...links]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]]
    
    setLinks(newLinks)
    
    try {
      await Promise.all(newLinks.map((link, i) => 
        fetch(`/api/users/${initialUser.username}/links/${link.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i })
        })
      ))
    } catch (e) {
      console.error('Move error:', e)
    }
  }

  return (
    <div className={`container`}> 
      <div className={`card`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{initialUser?.username ?? 'User'}</h2>
            <p className="muted">Twitter: @{initialUser?.twitterHandle || '未设置'}</p>
          </div>
          <select value={themeId} onChange={e => handleThemeChange(Number(e.target.value))} style={{ padding: '0.25rem 0.5rem' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>主题 {i + 1}</option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: '1rem' }}>
          {isEditingProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="text" value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} placeholder="Twitter handle" />
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="个人简介" rows={2} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSaveProfile}>保存</button>
                <button onClick={() => setIsEditingProfile(false)}>取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsEditingProfile(true)}>编辑资料</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>外部链接</h3>
          <button onClick={() => setIsEditingLinks(!isEditingLinks)}>
            {isEditingLinks ? '完成' : '编辑外部链接'}
          </button>
        </div>
        
        {isEditingLinks ? (
          <div>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  value={newLink.label}
                  onChange={e => setNewLink({...newLink, label: e.target.value})}
                  placeholder="链接名称"
                  style={{ flex: 1 }}
                />
                <input 
                  type="text" 
                  value={newLink.url}
                  onChange={e => setNewLink({...newLink, url: e.target.value})}
                  placeholder="https://..."
                  style={{ flex: 2 }}
                />
                <button onClick={handleAddLink} disabled={links.length >= 9}>添加</button>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                已添加 {links.length}/9 条链接
              </div>
            </div>
            
            {links.map((link, index) => (
              <div key={link.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem',
                marginBottom: '0.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px'
              }}>
                <span style={{ minWidth: '24px' }}>{index + 1}.</span>
                <span style={{ flex: 1 }}>{link.label}</span>
                <span style={{ flex: 2, color: 'var(--muted)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.url}</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => handleMoveLink(index, 'up')} disabled={index === 0} style={{ padding: '0.25rem 0.5rem' }}>↑</button>
                  <button onClick={() => handleMoveLink(index, 'down')} disabled={index === links.length - 1} style={{ padding: '0.25rem 0.5rem' }}>↓</button>
                  <button onClick={() => handleDeleteLink(link.id!)} style={{ padding: '0.25rem 0.5rem', color: '#ff4444' }}>删除</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {links.length === 0 ? (
              <p className="muted">暂无外部链接，点击"编辑外部链接"添加</p>
            ) : (
              links.map((link, index) => (
                <div key={link.id} style={{ marginBottom: '0.5rem' }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)' }}>
                    {index + 1}. {link.label}
                  </a>
                </div>
              ))
            )}
          </div>
        )}
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
  let user = db.getUserByUsername(username)
  if (!user) {
    const genId = () => 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
    user = db.createUser({
      id: genId(),
      walletAddress: '0x0',
      username,
      twitterHandle: '',
      themeId: 1,
      avatarUrl: '',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  const currentLinks = db.getLinks(user.id) ?? []
  const links = currentLinks.map((l: any) => ({ id: l.id, label: l.label, url: l.url }))
  return {
    props: {
      user,
      links
    }
  }
}

export default UserBlog