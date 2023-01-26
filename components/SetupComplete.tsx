import { formatNumber, NumberType } from '@/format'
import { colors } from '@/styles/colors'
import { BackupState } from '@/types'
import styled from '@emotion/styled'
import Link from 'next/link'
import { Back } from './Back'
import { getApprovedValue } from './TokenSelector'

export function SetupComplete({ backup, tokenBalances }: { backup: BackupState; tokenBalances: any }) {
  const totalValue = getApprovedValue(backup.tokens, tokenBalances)
  return (
    <Container>
      {backup.tokens.length} tokens worth {formatNumber(totalValue, NumberType.FiatTokenPrice)} currently backed up
      <StyledLink href="/recovery">Start a recovery</StyledLink>
    </Container>
  )
}

const StyledLink = styled(Link)`
  font-size: 32px;
  color: ${colors.blue400};
  text-decoration: none;
`

const Container = styled.div`
  padding: 20px 48px 0 48px;
  gap: 20px;

  display: flex;
  flex-flow: column;
  overflow: hidden;

  font-size: 72px;
  align-self: center;

  display: flex;
  flex-flow: column;
  gap: 12px;
`
