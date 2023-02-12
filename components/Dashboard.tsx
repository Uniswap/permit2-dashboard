import { permit_abi } from '@/abi/permit'
import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { textChangeRangeNewSpan } from 'typescript'
import { useProvider, useAccount } from 'wagmi'

type TokenAndSpender = {
  token: string
  spender: string
}
const PERMIT2="0x000000000022d473030f116ddee9f6b43ac78ba3"

export default function Dashboard() {
  const provider = useProvider()
  const { address } = useAccount()
  const [tokensAndSpenders, setTokensAndSpenders] = useState<TokenAndSpender[]>([])

  useEffect(() => {
    async function doStuff() {
      const permit2Contract = new ethers.Contract(PERMIT2, new ethers.utils.Interface(permit_abi), provider)
      const filter = permit2Contract.filters.Permit(address)
      const events = await permit2Contract.queryFilter(filter)
      const tokensAndSpenders = events.map((event)=> {
        const args = event.args
        const token = args?.[1]
        const spender = args?.[2]
        return {token: token,spender: spender}
      })
      setTokensAndSpenders(tokensAndSpenders)
    }

    doStuff()
  }, [address, provider])


  console.log('tokenAndSpenders', tokensAndSpenders)
  return <div>hi</div>
}
