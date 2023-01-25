import { ChainId, useAccount } from '@/utils'
import styled from '@emotion/styled'
import { goerli, useNetwork } from 'wagmi'

const CHAIN_ID_TO_COLORS: { [id: string]: { background: string; text: string } } = {
  '1': {
    background: '#E2EEFF',
    text: '#2C80FF',
  },
  '5': {
    background: '#FFF0FD',
    text: '#FF1BDA',
  },
  '80001': {
    background: '#EFE4FF',
    text: '#914EFF',
  },
}

const chainToName = {
  [ChainId.Mainnet]: 'Ethereum',
  [ChainId.Goerli]: 'Goerli',
}

export default function NetworkLogo() {
  const { chain } = useAccount()
  const colors = chain ? CHAIN_ID_TO_COLORS[String(chain.id)] : null
  return <Container style={{ backgroundColor: colors?.background, color: colors?.text }}>{chain?.name}</Container>
}

const Container = styled.div`
  padding: 6px 12px;
  border-radius: 12px;
`
