import { useAsyncData } from '@/util/hooks'
import { revoke } from '@/permit2'
import { getPermittedTokensAndSpenders } from '@/util/util'
import { useCallback } from 'react'
import { useProvider, useAccount, useSigner } from 'wagmi'

export default function Dashboard() {
  const provider = useProvider()
  const { address } = useAccount()
  const { data: signer } = useSigner()

  const fetchData = useCallback(() => {
    if (!address) return

    return getPermittedTokensAndSpenders(provider, address)
  }, [provider, address])

  const { data: spendersAndTokens } = useAsyncData(fetchData)

  if (!spendersAndTokens) return <div>Loading...</div>

  const onRevoke = async (spender: string, tokens: string[]) => {
    if (!signer) {
      console.log('no spender')
      return
    }
    await revoke(signer, tokens.map((token) => ({ spender, token })))
  }

  return <div>{spendersAndTokens?.map(([spender, tokens]) => (
    <div key={spender}>
      Spender: {spender} <br />
      {tokens.map(token => <div key={token}>Token: {token}</div>)}
      <button onClick={() => onRevoke(spender, tokens)}>
        Revoke
      </button>
    </div>
  ))}</div>
}
