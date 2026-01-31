import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.siwe_token
  if (token) {
    res.status(200).json({ loggedIn: true })
  } else {
    res.status(401).json({ loggedIn: false })
  }
}