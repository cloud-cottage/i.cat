import type { GetServerSideProps, NextPage } from 'next'
import React, { useEffect } from 'react'
import { db } from '../lib/db'

type LinkItem = { label: string; url: string }

type Props = {
  user: any
  links: LinkItem[]
}

const UserBlog: NextPage<Props> = ({ user, links }) => {
  useEffect(() => {
    // hydrate web components data
    const el = document.querySelector('lc-link-list') as any
    if (el) {
      el.data = links
    }
    // setup theme switcher
    const tsh = document.querySelector('tw-theme-switcher') as any
    if (tsh) {
      const themes = Array.from({ length: 9 }).map((_, i) => ({ id: i + 1, name: `Theme ${i+1}`, className: `theme-${i+1}` }))
      tsh.themes = themes
      tsh.addEventListener('themechange', (e: any) => {
        const id = e?.detail?.themeId
        if (id) {
          document.body.classList.remove(...Array.from({length:9}, (_,i)=>`theme-${i+1}`))
          document.body.classList.add(`theme-${id}`)
        }
      })
    }
    // set default theme
    document.body.classList.add('theme-1')
  }, [links])
  return (
    <div className={`container`}> 
      <div className={`card`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{user?.username ?? 'User'}</h2>
          <div>SIWE 登录占位</div>
        </div>
        <p className="muted">Twitter: @{user?.twitterHandle ?? '未设置'}</p>
      </div>

      <div className="card" style={{ marginTop: '0.5rem' }}>
        {/* Theme switcher component */}
        { /* @ts-ignore */ }
        {React.createElement('tw-theme-switcher', null, null)}
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
