import { formatNumber } from '@/format'
import { colors } from '@/styles/colors'
import { RecoveryData } from '@/types'
import styled from '@emotion/styled'

export function ConfirmStartRecovery({
  backedUpTokens,
  backedUpBalance,
  recoveryData,
}: {
  backedUpTokens: string[]
  backedUpBalance: number
  recoveryData: RecoveryData
}) {
  const signaturesLeft = recoveryData.squad.length - Object.keys(recoveryData.signatures ?? {}).length
  return (
    <LeftContainer>
      <div>
        {backedUpTokens.length} tokens worth ${formatNumber(backedUpBalance)} currently backed up.
      </div>
      <div
        style={{
          alignItems: 'flex-start',
          color: colors.black,
          display: 'flex',
          flexFlow: 'column',
          gap: '12px',
        }}
      >
        <div style={{ color: colors.red, fontSize: '72px' }}>Recovery in progress...</div>
        <div style={{ fontSize: '40px' }}>Waiting for {signaturesLeft} signers</div>
      </div>

      <RecoveryLink>https://token-backup-interface.vercel.app/recover/{recoveryData.identifier}</RecoveryLink>
    </LeftContainer>
  )
}

const RecoveryLink = styled.div`
  padding: 8px 12px;
  background-color: ${colors.gray300};
  color: white;
  border-radius: 25px;
`

const LeftContainer = styled.div`
  padding: 20px 48px;
  gap: 20px;

  display: flex;
  flex-flow: column;
  overflow: hidden;
  align-items: flex-start;
  justify-content: center;
`
