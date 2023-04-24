import { useAsyncData } from '@/util/hooks'
import { revoke } from '@/permit2'
import { useCallback } from 'react'
import { useProvider, useAccount, useSigner } from 'wagmi'
import { getAllowancesForAddress } from '@/permit2'
import moment from 'moment';

export default function Dashboard() {
  const provider = useProvider()
  const { address } = useAccount()
  const { data: signer } = useSigner()

  const fetchData = useCallback(() => {
    if (!address) return

    return getAllowancesForAddress(provider, address)
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

  return <div>{Object.keys(spendersAndTokens)?.map((spender) => (
    <div key={spender}>
      Spender: {spender} <br />
      {Object.entries(spendersAndTokens[spender]).map(([token, { amount, expiration }]) => (
        <div key={token}>
          <div>Token: {token}</div>
          <div>amount: {amount.toString()}</div>
          <div>expiration: {moment(expiration * 1000).fromNow()}</div>

          {signer && amount.gt(0) && expiration > Date.now() &&
            <button onClick={() => onRevoke(spender, [token])}>
              Revoke
            </button>
          }
        </div>
      ))}
    </div>
  ))}</div>
}
