import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
// simple id generator for MVP
const genId = () => 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query
  if (typeof username !== 'string') {
    return res.status(400).json({ error: 'invalid username' })
  }
  if (req.method === 'GET') {
    // Try to fetch user
    let user = db.getUserByUsername(username)
    if (!user) {
      // create a placeholder user for MVP demo if not exist
      const newUser = {
      id: genId(),
        walletAddress: '0x0000',
        username,
        twitterHandle: '',
        themeId: 1,
        avatarUrl: '',
        bio: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      db.createUser(newUser)
      user = newUser
    }
    const links = db.getLinks(user.id)
    return res.status(200).json({ user, links })
  }
  res.status(405).json({ error: 'Method not allowed' })
}
