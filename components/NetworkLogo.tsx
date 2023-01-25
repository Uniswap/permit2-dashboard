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

export default function NetworkLogo() {
  const chainInfo = useNetwork().chain ?? goerli
  const colors = CHAIN_ID_TO_COLORS[String(chainInfo.id)]
  return <Container style={{ backgroundColor: colors?.background, color: colors?.text }}>{chainInfo.name}</Container>
}

const Container = styled.div`
  padding: 6px 12px;
  border-radius: 12px;
`
