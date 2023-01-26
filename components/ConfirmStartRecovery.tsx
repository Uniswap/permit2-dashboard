import { formatNumber } from '@/format'
import { colors } from '@/styles/colors'
import styled from '@emotion/styled'

export function ConfirmStartRecovery({
  backedUpTokens,
  backedUpBalance,
}: {
  backedUpTokens: string[]
  backedUpBalance: number
}) {
  return (
    <LeftContainer>
      <div
        style={{
          padding: '10px',
          alignItems: 'center',
          fontSize: '72px',
          color: colors.black,
        }}
      >
        {backedUpTokens.length} tokens worth ${formatNumber(backedUpBalance)} currently backed up
      </div>
      <button>Start recovery</button>
    </LeftContainer>
  )
}

const LeftContainer = styled.div`
  padding: 20px 48px;
  gap: 20px;

  display: flex;
  flex-flow: column;
  overflow: hidden;
`
