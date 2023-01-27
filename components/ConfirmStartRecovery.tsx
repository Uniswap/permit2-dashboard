import { formatNumber } from '@/format'
import { colors } from '@/styles/colors'
import { RecoveryData } from '@/types'
import styled from '@emotion/styled'
import Copy from '@/components/copy.svg'
import { useEffect, useState } from 'react'
import { getRecoveryData } from '@/backend'
import { useRouter } from 'next/router'

const POLL_INTERVAL = 3000 // 3s

function usePollRecovery(setRecoveryData: any, identifier?: string | null) {
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!identifier) return
      const recoveryData = await getRecoveryData(identifier)
      const signatures = recoveryData.data.signatures
      setRecoveryData(
        (prev: RecoveryData) =>
          ({
            ...prev,
            signatures,
          } as RecoveryData)
      )
    }, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [setRecoveryData, identifier])
}

export function ConfirmStartRecovery({
  backedUpTokens,
  backedUpBalance,
  recoveryData,
  setRecoveryData,
}: {
  backedUpTokens: string[]
  backedUpBalance: number
  recoveryData: RecoveryData
  setRecoveryData: any
}) {
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''
  const rescueLink = `${origin}/rescue/${recoveryData.identifier}`
  
  const [copied, setCopied] = useState(false)
  const signaturesLeft = recoveryData.squad.length - Object.keys(recoveryData.signatures ?? {}).length

  const onCopy = () => {
    navigator.clipboard.writeText(rescueLink)
    setCopied(true)
  }

  usePollRecovery(setRecoveryData, recoveryData.identifier)

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
