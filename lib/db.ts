type User = {
  id: string
  walletAddress: string
  username: string
  twitterHandle?: string
  themeId: number
  avatarUrl?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

type Link = {
  id: string
  userId: string
  label: string
  url: string
  description?: string
  order: number
  createdAt: string
  updatedAt: string
}

type TweetCache = {
  userId: string
  tweets: string[]
  fetchedAt: string
}

const users = new Map<string, User>()
const links = new Map<string, Link[]>()
const tweetsCache = new Map<string, TweetCache>()

export const db = {
  getUserByUsername: (username: string) => {
    for (const u of users.values()) {
      if (u.username === username) return u
    }
    return null
  },
  createUser: (u: User) => {
    users.set(u.id, u)
    if (!links.has(u.id)) links.set(u.id, [])
    return u
  },
  getLinks: (userId: string) => links.get(userId) || [],
  setLinks: (userId: string, list: Link[]) => links.set(userId, list),
  getTweetCache: (userId: string) => tweetsCache.get(userId) || null,
  setTweetCache: (userId: string, tweets: string[]) => {
    tweetsCache.set(userId, { userId, tweets, fetchedAt: new Date().toISOString() })
  }
}

export default db
