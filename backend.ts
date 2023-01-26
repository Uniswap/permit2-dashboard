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
