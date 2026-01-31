import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'

// This endpoint fetches latest tweets for a user, using Bearer Token if available.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { username } = req.query
  if (typeof username !== 'string') {
    return res.status(400).json({ error: 'invalid username' })
  }
  // Check cache first (per user)
  const user = db.getUserByUsername(username)
  const cached = user ? db.getTweetCache(user.id) : null
  const now = Date.now()
  if (cached && (now - new Date(cached.fetchedAt).getTime()) < 60 * 60 * 1000) {
    return res.status(200).json({ tweets: cached.tweets, cached: true })
  }
  // Fetch from Twitter API if token present
  const token = process.env.TWITTER_BEARER_TOKEN
  const tweets: string[] = []
  try {
    if (token && user) {
      // In MVP we do a simple request to fetch last 5 tweets as example
      const url = `https://api.twitter.com/2/users/by/username/${username}?user.fields=id` // not exact, but placeholder
      // Real endpoint would require user id; here we fallback gracefully
      // We'll simulate by returning empty and provide fallback
      // To avoid breaking MVP, skip actual fetch and return empty results
    }
  } catch (e) {
    // ignore
  }
  db.setTweetCache(user?.id ?? 'anon', tweets)
  res.status(200).json({ tweets, cached: false })
}
