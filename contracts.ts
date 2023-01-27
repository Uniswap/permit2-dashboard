import { Provider } from '@wagmi/core'
import { Contract, Signer } from 'ethers'
import { Erc20 } from './abi/erc20'
import { TokenBackups, TokenBackups__factory } from './abi';
import Erc20ABI from '@/abi/erc20.json'
import { TOKEN_BACKUPS_ADDRESS } from './backups'

export function getTokenContract(address: string, provider: Provider | Signer): Erc20 {
  return new Contract(address, Erc20ABI, provider) as Erc20
}

export function getTokenBackups(provider: Provider | Signer): TokenBackups {
  return TokenBackups__factory.connect(TOKEN_BACKUPS_ADDRESS, provider)
}

export const PERMIT2_CONTRACT_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3'
