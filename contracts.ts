import { Provider } from '@wagmi/core'
import { Contract, Signer } from 'ethers'
import { Erc20 } from './abi/erc20'
import Erc20ABI from '@/abi/Erc20.json'

export function getTokenContract(address: string, provider: Provider | Signer): Erc20 {
  return new Contract(address, Erc20ABI, provider) as Erc20
}

export const PERMIT2_CONTRACT_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3'
