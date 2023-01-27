import styled from '@emotion/styled'
import { BigNumber } from 'ethers'
import { parseEther } from 'ethers/lib/utils.js'
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

function prepareTokenBalances(balances: any) {
  if (!balances) return

  const output: { [address: string]: BigNumber } = {}
  for (var i = 0; i < balances.length; i++) {
    output[balances[i].token.address as string] = parseEther(String(balances[i].quantity))
  }

  return output
}

export function RescueModal({
  showModal,
  setShowModal,
  confirmRescue,
  recipientAddress,
  tokenBalances,
}: {
  showModal: boolean
  setShowModal: (arg0: boolean) => void
  confirmRescue: (arg0: any) => void
  recipientAddress: string
  tokenBalances: any
}) {
  const [approveAddress, setApproveAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const balances = prepareTokenBalances(tokenBalances)

  console.log('balances', balances)

  const onConfirm = async () => {
    if (approveAddress.toLowerCase() !== recipientAddress.toLowerCase()) {
      setError('Wrong recipient address!')
      return
    }

    // sign data here
  }

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
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ModalButtons>
        <button style={{ color: '#888FAB', cursor: 'pointer' }} onClick={() => setShowModal(false)}>
          Cancel
        </button>
        <button style={{ color: '#4C82FB', cursor: 'pointer' }} onClick={confirmRescue}>
          {loading ? 'Sign in wallet...' : 'Confirm'}
        </button>
      </ModalButtons>
    </Modal>
  )
}

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
  > button {
    background: none;
    border: none;
    padding: 0;
    font-size: 32px;
  }
`

const Container = styled.div`
  position: absolute;
  background-color: white;
`
