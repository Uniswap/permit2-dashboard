import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { permit_abi } from '@/abi/permit'
import { Provider } from '@wagmi/core'
import { ethers } from 'ethers'

type Token = string
type Spender = string

export async function getPermittedTokensAndSpenders(
  provider: Provider,
  address: string
): Promise<[Spender, Token[]][]> {
  const permit2Contract = new ethers.Contract(PERMIT2_ADDRESS, new ethers.utils.Interface(permit_abi), provider)
  const filter = permit2Contract.filters.Permit(address)
  const events = await permit2Contract.queryFilter(filter)

  // get unique tokens and spenders
  const spenderToTokens: { [spenderAddress: Spender]: Set<Token> } = {}
  for (const event of events) {
    const args = event.args
    const token = args?.[1]
    const spender = args?.[2]
    if (spenderToTokens[spender]) {
      spenderToTokens[spender].add(token)
    } else {
      spenderToTokens[spender] = new Set([token])
    }
  }

  return Object.keys(spenderToTokens).map((spender) => [spender, Array.from(spenderToTokens[spender])])
}
