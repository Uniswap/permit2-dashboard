import axios from 'axios'

const BACKEND_URL = 'https://g4fzh009re.execute-api.us-west-2.amazonaws.com/prod/token-backup'

export async function savePermitData(
  permitSignature: string,
  // this has to be resolved addresses for ENS values
  squad: string[],
  owner: string,
  chainId: number,
  tokens: string[],
  nonce: string
) {
  try {
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
        nonce
      }),
    })

    return await res.json()
  } catch (e) {
    console.log(e)
    throw new Error('Error saving permit data.')
  }
}

export async function getPermitData(owner: string) {
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

export async function startRecovery(owner: string, recipient: string, recoveryId: string) {
  try {
    const url = `${BACKEND_URL}/recovery/start/${owner}`
    const formattedRequest = {
      method: 'post',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
      },
      data: JSON.stringify({
        recipient,
        recoveryId,
      }),
      url,
    }
    return await axios(formattedRequest)
  } catch (e) {
    console.log(e)
    throw new Error('Error starting recovery from the back up service.')
  }
}

export async function signRecovery(uuid: string, signature: string, signer: string) {
  try {
    const url = `${BACKEND_URL}/recovery/sign`
    const formattedRequest = {
      method: 'post',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
      },
      data: JSON.stringify({
        uuid,
        signature,
        signer,
      }),
      url,
    }
    return await axios(formattedRequest)
  } catch (e) {
    console.log(e)
    throw new Error('Error signing recovery from the back up service.')
  }
}

export async function completeRecovery(uuid: string, txHash: string) {
  try {
    const url = `${BACKEND_URL}/recovery/complete`
    const formattedRequest = {
      method: 'post',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
      },
      data: JSON.stringify({
        uuid,
        txHash,
      }),
      url,
    }
    return await axios(formattedRequest)
  } catch (e) {
    console.log(e)
    throw new Error('Error completing recovery from the back up service.')
  }
}

export async function getRecoveryData(uuid: string) {
  try {
    const url = `${BACKEND_URL}/recovery/${uuid}`
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
    console.log(e)
    throw new Error('Error getting recovery data from the back up service.')
  }
}
