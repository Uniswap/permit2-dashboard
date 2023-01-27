import { colors } from '@/styles/colors'
import { RecoveryData } from '@/types'
import styled from '@emotion/styled'

export function RescueStatus({
  recoveryData,
  showModal,
  setShowModal,
}: {
  recoveryData: RecoveryData
  showModal: boolean
  setShowModal: (arg0: boolean) => void
}) {
  const signaturesLeft = recoveryData.squad.length - Object.keys(recoveryData.signatures ?? {}).length

  return (
    <LeftContainer>
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
        <div style={{ fontSize: '40px', paddingBottom: '5px' }}>Waiting for {signaturesLeft} signers</div>
        <button
          style={{
            fontSize: '24px',
            maxWidth: '435px',
            cursor: 'pointer',
            fontFamily: 'Replica',
          }}
          onClick={() => setShowModal(!showModal)}
        >
          Approve Rescue
        </button>
      </div>
    </LeftContainer>
  )
}

const LeftContainer = styled.div`
  padding: 20px 48px;
  gap: 20px;

  display: flex;
  flex-flow: column;
  overflow: hidden;
  align-items: flex-start;
  justify-content: center;
`
