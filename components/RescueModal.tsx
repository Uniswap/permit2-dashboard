import styled from '@emotion/styled'
import { useState } from 'react'
import Modal from 'react-modal'
import { RescueInput } from './RescueInput'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '500px',
    borderRadius: '32px',
  },
}

export function RescueModal({
  showModal,
  setShowModal,
  confirmRescue,
}: {
  showModal: boolean
  setShowModal: (arg0: boolean) => void
  confirmRescue: (arg0: any) => void
}) {
  const [approveAddress, setApproveAddress] = useState('')

  return (
    <Modal
      isOpen={showModal}
      contentLabel="Example Modal"
      style={customStyles}
      onRequestClose={() => setShowModal(false)}
    >
      <div style={{ fontSize: '32px', paddingBottom: '24px' }}>Confirm recovery address</div>
      <div style={{ fontSize: '20px', paddingBottom: '24px' }}>This will recovery to the following address:</div>
      <RescueInput value={approveAddress} onChange={setApproveAddress} title={''} placeholder={'0x123'} />
      <div style={{ fontSize: '20px', paddingTop: '24px', paddingBottom: '24px' }}>
        Verify with the owner that this is the correct address
      </div>
      <div style={{ display: 'flex', fontSize: '32px' }}>
        <div style={{ flex: '1', color: '#888FAB', cursor: 'pointer' }} onClick={() => setShowModal(false)}>
          Cancel
        </div>
        <div style={{ flex: '2' }} />
        <div style={{ flex: '1', textAlign: 'right', color: '#4C82FB', cursor: 'pointer' }} onClick={confirmRescue}>
          Confirm
        </div>
      </div>
    </Modal>
  )
}

const Container = styled.div`
  position: absolute;
  background-color: white;
`
