import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../../lib/db'
// simple id generator for MVP
const genId = () => 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query
  if (typeof username !== 'string') {
    return res.status(400).json({ error: 'invalid username' })
  }
  const user = db.getUserByUsername(username)
  if (!user) {
    return res.status(404).json({ error: 'user not found' })
  }
  if (req.method === 'GET') {
    const list = db.getLinks(user.id)
    return res.status(200).json({ links: list })
  } else if (req.method === 'POST') {
    const { label, url } = req.body ?? {}
    const current = db.getLinks(user.id)
    if (current.length >= 9) {
      return res.status(400).json({ error: 'maximum 9 links' })
    }
    const newLink = {
      id: genId(),
      userId: user.id,
      label: label ?? '',
      url: url ?? '',
      order: current.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [...current, newLink]
    db.setLinks(user.id, updated)
    return res.status(201).json({ link: newLink, links: updated })
  }
  res.status(405).json({ error: 'Method not allowed' })
}
