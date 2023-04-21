import { useAsyncData } from '@/util/hooks'
import { getAllowancesForAddress } from '@/permit2'
import { useCallback } from 'react'
import { useProvider, useAccount } from 'wagmi'
import moment from 'moment';

export default function Dashboard() {
  const provider = useProvider()
  const { address } = useAccount()

  const fetchData = useCallback(() => {
    if (!address) return

    return getAllowancesForAddress(provider, address)
  }, [provider, address])


  const { data: spendersAndTokens } = useAsyncData(fetchData)

  if (!spendersAndTokens) return <div>Loading...</div>

  return <div>{Object.keys(spendersAndTokens)?.map((spender) => (
    <div key={spender}>
      Spender: {spender} <br />
      {Object.entries(spendersAndTokens[spender]).map(([token, { amount, expiration }]) => (
        <div>
          <div key={token}>Token: {token}</div>
          <div key={amount.toString()}>amount: {amount.toString()}</div>
          <div key={expiration}>expiration: {moment(expiration * 1000).fromNow()}</div>
        </div>
      ))}
    </div>
  ))}</div>
}
