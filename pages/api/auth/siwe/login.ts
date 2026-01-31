import type { NextApiRequest, NextApiResponse } from 'next'
// simple id generator for MVP (no external dependency)
const genId = () => 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }
  const { walletAddress } = req.body ?? {}
  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress required' })
  }
  // In MVP we simply issue a session-like token via cookie (no real SIWE nonce flow)
  const token = genId()
  res.setHeader('Set-Cookie', `siwe_token=${token}; HttpOnly; Path=/; Max-Age=3600`)
  res.status(200).json({ ok: true, walletAddress, token })
}
