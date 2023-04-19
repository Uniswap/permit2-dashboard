import { useAsyncData } from '@/util/hooks'
import { getPermittedTokensAndSpenders } from '@/util/util'
import { useCallback } from 'react'
import { useProvider, useAccount } from 'wagmi'

export default function Dashboard() {
  const provider = useProvider()
  const { address } = useAccount()
  const fetchData = useCallback(() => {
    if (!address) return 

    return getPermittedTokensAndSpenders(provider, address)
  }, [provider, address])

  const { data: spendersAndTokens } = useAsyncData(fetchData)

  if (!spendersAndTokens) return <div>Loading...</div>

  return <div>{spendersAndTokens?.map(([spender, tokens]) => (
    <div>
      Spender: {spender} <br />
      {tokens.map(token => <div>Token: {token}</div>)}
    </div>
  ))}</div>
}
