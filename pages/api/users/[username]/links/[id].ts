import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, id } = req.query
  if (typeof username !== 'string' || typeof id !== 'string') {
    return res.status(400).json({ error: 'invalid params' })
  }
  const user = db.getUserByUsername(username)
  if (!user) return res.status(404).json({ error: 'user not found' })
  const current = db.getLinks(user.id)
  if (req.method === 'PUT') {
    const { label, url, order } = req.body ?? {}
    const idx = current.findIndex((l: any) => l.id === id)
    if (idx < 0) return res.status(404).json({ error: 'link not found' })
    const updatedLink = { ...current[idx], label: label ?? current[idx].label, url: url ?? current[idx].url, order: typeof order === 'number' ? order : current[idx].order, updatedAt: new Date().toISOString() }
    const updatedList = current.slice(); updatedList[idx] = updatedLink
    db.setLinks(user.id, updatedList)
    return res.status(200).json({ link: updatedLink, links: updatedList })
  } else if (req.method === 'DELETE') {
    const idx = current.findIndex((l: any) => l.id === id)
    if (idx < 0) return res.status(404).json({ error: 'link not found' })
    const updatedList = current.slice(); updatedList.splice(idx, 1)
    // re-assign orders
    updatedList.forEach((l: any, i: number) => l.order = i)
    db.setLinks(user.id, updatedList)
    return res.status(200).json({ links: updatedList })
  }
  res.status(405).json({ error: 'Method not allowed' })
}
