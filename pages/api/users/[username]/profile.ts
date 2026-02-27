import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../../lib/db'
const genId = () => 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { twitterHandle, themeId, bio, avatarUrl } = req.body ?? {}
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'invalid username' })
  }
  if (/^\d/.test(username)) {
    return res.status(400).json({ error: 'username cannot start with number' })
  }
  // find user or create placeholder
  let user = db.getUserByUsername(username)
  if (!user) {
    user = {
      id: genId(),
      walletAddress: '0x0000',
      username,
      twitterHandle: '',
      themeId: themeId ?? 1,
      avatarUrl: avatarUrl ?? '',
      bio: bio ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.createUser(user)
  }
  user.twitterHandle = twitterHandle ?? user.twitterHandle
  user.themeId = themeId ?? user.themeId
  user.avatarUrl = avatarUrl ?? user.avatarUrl
  user.bio = bio ?? user.bio
  user.updatedAt = new Date().toISOString()
  res.status(200).json({ user })
}
