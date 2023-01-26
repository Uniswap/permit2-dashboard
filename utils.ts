import { providers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount as useWagmiAccount, useNetwork } from 'wagmi'

export const EMPTY_ARRAY = []

export type Token = {
  chainId: ChainId
  address: string
}

// override wagmi's useAccount to work with NextJS SSR
// https://github.com/wagmi-dev/wagmi/issues/542
export function useAccount() {
  const { address, connector, isConnected } = useWagmiAccount()
  const { chain } = useNetwork()
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return { isLoaded, address: isLoaded ? address : null, connector, isConnected, chain: isLoaded ? chain : null }
}

export enum ChainId {
  Mainnet = 1,
  Goerli = 5,

  ArbitrumOne = 42161,
  Optimism = 10,
  Polygon = 137,
  PolygonMumbai = 80001,
}

export function isPolygonChain(chainId: number): chainId is ChainId.Polygon | ChainId.PolygonMumbai {
  return chainId === ChainId.PolygonMumbai || chainId === ChainId.Polygon
}

export function areAddressesEqual(a1?: string | null, a2?: string | null): boolean {
  return a1 !== null && a2 !== null && a1 === a2
}

/** Alternative addres used to denote a native currency (e.g. MATIC on Polygon) */
export const NATIVE_ADDRESS_ALT = '0x0000000000000000000000000000000000001010'
/** Address that represents native currencies on ETH, Polygon, etc. */
export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const isNativeCurrencyAddress = (chainId: ChainId, address?: string | null) => {
  if (!address) return true

  return isPolygonChain(chainId)
    ? areAddressesEqual(address, NATIVE_ADDRESS_ALT)
    : areAddressesEqual(address, NATIVE_ADDRESS)
}

// graphql chain names
export enum Chain {
  Arbitrum = 'ARBITRUM',
  Celo = 'CELO',
  Ethereum = 'ETHEREUM',
  EthereumGoerli = 'ETHEREUM_GOERLI',
  Optimism = 'OPTIMISM',
  Polygon = 'POLYGON',
}

export function fromGraphQLChain(chain: Chain | undefined): ChainId | null {
  switch (chain) {
    case Chain.Ethereum:
      return ChainId.Mainnet
    case Chain.Arbitrum:
      return ChainId.ArbitrumOne
    case Chain.EthereumGoerli:
      return ChainId.Goerli
    case Chain.Optimism:
      return ChainId.Optimism
    case Chain.Polygon:
      return ChainId.Polygon
  }

  return null
}

export async function resolveENS(provider: providers.Provider, squad: string[]): Promise<string[]> {
  const resolved = []
  for (var i = 0; i < squad.length; i++) {
    if (squad[i].endsWith('.eth')) {
      const resolvedAddress = await provider.resolveName(squad[i])
      if (!resolvedAddress) {
        throw new Error('No address found for ENS')
      }

      resolved[i] = resolvedAddress
    } else {
      resolved[i] = squad[i]
    }
  }

  return resolved
}
