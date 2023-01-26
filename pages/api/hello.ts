// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
const TOKEN_BACKUP_SERVICE_URL = 'https://s9330mb9zg.execute-api.us-west-2.amazonaws.com/prod/token-backup'
type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'John Doe' })
}


export async function getBackUpData(owner: string) {
  try {
    const url = `${TOKEN_BACKUP_SERVICE_URL}/permit/${owner}`
    const optionNonce = {
      method: 'get',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
      },
      url,
    }
    return await axios(optionNonce)
  } catch (e) {
    throw new Error('Error fetching back up from service.')
  }
}