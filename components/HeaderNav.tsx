import { colors } from '@/styles/colors'
import styled from '@emotion/styled'
import { ConnectKitButton } from 'connectkit'
import Link from 'next/link'
import NetworkLogo from './NetworkLogo'

export function HeaderNav() {
  return (
    <Container>
      <Left>
        <Title href="/">Token Backup</Title>
        <NetworkLogo />
      </Left>
      <Right>
        <StyledLink href="/recover">Begin Recovery</StyledLink>
        <ConnectKitButton theme="rounded" />
      </Right>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;

  padding: 48px;
  color: ${colors.green400};

  @media only screen and (max-width: 900px) {
    flex-flow: column;
    justify-content: center;
  }
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 36px;
  font-weight: 500;
  font-size: 24px;

  // connect kit button
  button:hover,
  button:focus,
  button:focus-visible {
    transform: scale(1.05);
    transition-duration: 0.2s;
    outline: none !important;
  }

  button {
    transition-duration: 0.2s;
  }

  @media only screen and (max-width: 900px) {
    flex-flow: column;
    justify-content: center;
    gap: 4px;
  }
`

const StyledLink = styled(Link)`
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 250ms;

  &:focus {
    background-color: ${colors.green300};
    outline: none;
  }

  @media only screen and (max-width: 900px) {
    padding: 4px;
  }
`

const Title = styled(Link)`
  font-size: 32px;
  font-weight: 600;
`
