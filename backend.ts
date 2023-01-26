import axios from 'axios'

const BACKEND_URL = 'https://s9330mb9zg.execute-api.us-west-2.amazonaws.com/prod/token-backup'

export async function savePermitData(
  permitSignature: string,
  // this has to be resolved addresses for ENS values
  squad: string[],
  owner: string,
  chainId: number,
  tokens: string[]
) {
  const res = await fetch(`${BACKEND_URL}/permit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      permit: permitSignature,
      recoveryAddresses: squad,
      owner,
      recoveryScheme: {
        m: 2,
        n: 3,
      },
      chainId,
      tokens,
    }),
  })

  return await res.json()
}

export async function getBackUpData(owner: string) {
  try {
    const url = `${BACKEND_URL}/permit/${owner}`
    const formattedRequest = {
      method: 'get',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
      },
      url,
    }
    return await axios(formattedRequest)
  } catch (e) {
    throw new Error('Error fetching back up from service.')
  }
}

export async function startRecovery(owner: string, recipient: string) {
  try {
    const url = `${BACKEND_URL}/recovery/start/${owner}`
    const formattedRequest = {
      method: 'post',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
      },
      data: JSON.stringify({
        recipient: recipient,
      }),
      url,
    }
    return await axios(formattedRequest)
  } catch (e) {
    console.log(e)
    throw new Error('Error starting recovery from the back up service.')
  }
}
