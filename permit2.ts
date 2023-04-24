import { BigNumber, ContractTransaction } from 'ethers'
import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethers-multicall'
import Permit2Abi from '@/abis/Permit2.json'
import { Permit2__factory } from '@/types/ethers-contracts'
import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { Provider, Signer } from '@wagmi/core'

type Token = string
type Spender = string

export type TokenSpender = {
  token: Token
  spender: Spender
}

export type Allowances = {
  [spender: string]: {
    [token: string]: {
      amount: BigNumber
      expiration: number
    }
  }
}

// gets all tokens and spenders ever permitted
export async function getPermittedTokensAndSpenders(provider: Provider, address: string): Promise<TokenSpender[]> {
  const permit2Contract = Permit2__factory.connect(PERMIT2_ADDRESS, provider)
  const filter = permit2Contract.filters.Permit(address)
  const events = await permit2Contract.queryFilter(filter)

  // get unique tokens and spenders
  const result = []
  for (const event of events) {
    const args = event.args
    const token = args?.[1]
    const spender = args?.[2]
    result.push({ token, spender })
  }

  return result
}

// gets all tokens and spenders and amounts currently permitted
export async function getAllowances(provider: Provider, address: string, tokenSpenders: TokenSpender[]): Promise<Allowances> {
  const multicallProvider = new MulticallProvider(provider)
  await multicallProvider.init()
  const permit2Contract = new MulticallContract(PERMIT2_ADDRESS, Permit2Abi)

  const calls = tokenSpenders.map(({ token, spender }) =>
    permit2Contract.allowance(address, token, spender)
  )

  const results = await multicallProvider.all(calls)

  const allowances: Allowances = {};
  for (let i = 0; i < tokenSpenders.length; i++) {
    const { token, spender } = tokenSpenders[i]
    const [amount, expiration] = results[i]
    if (!allowances[spender]) {
      allowances[spender] = {}
    }
    allowances[spender][token] = { amount, expiration }
  }
  return allowances
}

// gets all tokens and spenders and amounts currently permitted
export async function getAllowancesForAddress(provider: Provider, address: string): Promise<Allowances> {
  const tokenSpenders = await getPermittedTokensAndSpenders(provider, address)
  return await getAllowances(provider, address, tokenSpenders)
}

export async function revoke(owner: Signer, toRevoke: TokenSpender[]): Promise<ContractTransaction> {
  const permit2Contract = Permit2__factory.connect(PERMIT2_ADDRESS, owner)
  return await permit2Contract.lockdown(toRevoke)
}
