import { formatNumber } from '@/format'
import { colors } from '@/styles/colors'
import { RecoveryData } from '@/types'
import styled from '@emotion/styled'
import Copy from '@/components/copy.svg'
import { useState } from 'react'

export function ConfirmStartRecovery({
  backedUpTokens,
  backedUpBalance,
  recoveryData,
}: {
  backedUpTokens: string[]
  backedUpBalance: number
  recoveryData: RecoveryData
}) {
  const rescueLink = `https://token-backup-interface.vercel.app/recover/${recoveryData.identifier}`
  const [copied, setCopied] = useState(false)
  const signaturesLeft = recoveryData.squad.length - Object.keys(recoveryData.signatures ?? {}).length
  const onCopy = () => {
    navigator.clipboard.writeText(rescueLink)
    setCopied(true)
  }
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
      <RecoveryLink>
        <div>{rescueLink}</div>
        <CopyButton onClick={onCopy}>
          <Copy fill={copied ? colors.green : 'white'} />
        </CopyButton>
      </RecoveryLink>
    </LeftContainer>
  )
}

const CopyButton = styled.button`
  background: none;
  border: none;
  padding: 10px;
  &:hover {
    oapcity: 0.5;
  }
  cursor: pointer;
`
const RecoveryLink = styled.div`
  padding: 8px 12px 8px 24px;
  background-color: ${colors.gray300};
  color: white;
  border-radius: 25px;

  display: flex;
  flex-flow: row;
  gap: 8px;
  align-items: center;
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
