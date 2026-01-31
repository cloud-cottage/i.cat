import type { NextApiRequest, NextApiResponse } from 'next'
// simple id generator for MVP (no external dependency)
const genId = () => 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  // Very basic session check: if no walletAddress, just validate existing token cookie for MVP
  const { walletAddress } = req.body ?? {}
  const token = req.cookies.siwe_token

  if (!walletAddress) {
    if (token) {
      return res.status(200).json({ ok: true, walletAddress: '0x0000', token })
    }
    return res.status(400).json({ error: 'walletAddress required' })
  }

  const newToken = genId()
  res.setHeader('Set-Cookie', `siwe_token=${newToken}; HttpOnly; Path=/; Max-Age=3600`)
  res.status(200).json({ ok: true, walletAddress, token: newToken })
}
