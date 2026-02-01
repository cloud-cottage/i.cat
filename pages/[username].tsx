import type { GetServerSideProps, NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { db } from '../lib/db'

type LinkItem = { id?: string; label: string; url: string; description?: string }

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
  const [newLink, setNewLink] = useState({ label: '', url: '', description: '' })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

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
    if (!newLink.label || !newLink.url) {
      alert('请填写链接名称和地址')
      return
    }
    if (links.length >= 9) {
      alert('最多只能添加 9 条链接')
      return
    }
    try {
      const res = await fetch(`/api/users/${initialUser.username}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      })
      const data = await res.json()
      if (data.link) {
        setLinks([...links, { id: data.link.id, label: data.link.label, url: data.link.url, description: data.link.description }])
        setNewLink({ label: '', url: '', description: '' })
      } else {
        alert('添加失败: ' + (data.error || '未知错误'))
      }
    } catch (e) {
      console.error('Add link error:', e)
      alert('网络错误')
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    setDragOverIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Set ghost image or data
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newLinks = [...links]
    const [movedItem] = newLinks.splice(draggedIndex, 1)
    newLinks.splice(dropIndex, 0, movedItem)
    
    setLinks(newLinks)
    setDraggedIndex(null)
    
    // Update order on server
    try {
      await Promise.all(newLinks.map((link, i) => 
        fetch(`/api/users/${initialUser.username}/links/${link.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i })
        })
      ))
    } catch (e) {
      console.error('Reorder error:', e)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
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
                <input 
                  type="text" 
                  value={newLink.description}
                  onChange={e => setNewLink({...newLink, description: e.target.value})}
                  placeholder="说明文字"
                  style={{ flex: 1.5 }}
                />
                <button onClick={handleAddLink} disabled={links.length >= 9}>添加</button>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                已添加 {links.length}/9 条链接
              </div>
            </div>
            
            {links.length > 0 && (
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                💡 拖拽链接可调整顺序
              </div>
            )}
            
            {links.map((link, index) => (
              <div 
                key={link.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.5rem', 
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: dragOverIndex === index 
                    ? 'rgba(37, 99, 235, 0.1)' 
                    : 'rgba(255,255,255,0.03)',
                  borderRadius: '6px',
                  border: dragOverIndex === index ? '2px dashed var(--link)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ minWidth: '24px', fontWeight: 'bold', marginTop: '0.25rem' }}>{index + 1}.</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)', fontWeight: 500, textDecoration: 'none' }}>
                    {link.label}
                  </a>
                  {link.description && (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{ 
                        color: 'var(--muted)', 
                        fontSize: '0.85rem',
                        cursor: 'move',
                        padding: '0.25rem 0.5rem',
                        background: draggedIndex === index ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        borderLeft: '3px solid var(--link)',
                        opacity: draggedIndex === index ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>⋮⋮</span>
                      <span>{link.description}</span>
                    </div>
                  )}
                  <span style={{ color: 'var(--muted)', fontSize: '0.75rem', opacity: 0.7 }}>{link.url}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
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
                <div key={link.id} style={{ marginBottom: '1rem', padding: '0.5rem 0' }}>
                  <div>
                    <span style={{ color: 'var(--muted)', marginRight: '0.5rem' }}>{index + 1}.</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)', fontWeight: 500, textDecoration: 'none' }}>
                      {link.label}
                    </a>
                  </div>
                  {link.description && <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginLeft: '1.5rem' }}>{link.description}</div>}
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
  const links = currentLinks.map((l: any) => ({ id: l.id, label: l.label, url: l.url, description: l.description }))
  return {
    props: {
      user,
      links
    }
  }
}

export default UserBlog