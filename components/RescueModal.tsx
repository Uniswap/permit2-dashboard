import { signRecovery } from '@/backend'
import { getPalRecoverySignatureData } from '@/backups'
import { RecoveryData } from '@/types'
import { useAccount } from '@/utils'
import styled from '@emotion/styled'
import { BigNumber, providers } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils.js'
import { useState } from 'react'
import Modal from 'react-modal'
import { useProvider, useSignTypedData } from 'wagmi'
import { RescueInput } from './RescueInput'
import { getTokenContract } from '@/contracts'
import { Provider } from '@wagmi/core'

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

async function prepareTokenBalances(balances: any, provider: Provider, owner: string) {
  const output: { [address: string]: BigNumber } = {}
  for (var i = 0; i < balances.length; i++) {
    const contract = getTokenContract(balances[i].token.address, provider)
    const balance = await contract.balanceOf(owner)
    output[balances[i].token.address as string] = balance
  }

  return output
}

export function RescueModal({
  showModal,
  setShowModal,
  confirmRescue,
  tokenBalances,
  recoveryData,
}: {
  showModal: boolean
  setShowModal: (arg0: boolean) => void
  confirmRescue: () => void
  tokenBalances: any
  recoveryData: RecoveryData
}) {
  const [approveAddress, setApproveAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signTypedDataAsync } = useSignTypedData()
  const address = useAccount().address
  const provider = useProvider()

  const onConfirm = async () => {
    if (approveAddress.toLowerCase() !== recoveryData.recipientAddress?.toLowerCase()) {
      setError('Wrong recipient address!')
      return
    }

    const { backupSignature, originalAddress, recipientAddress, deadline, tokens, identifier } = recoveryData

    console.log('identifier', identifier)
    if (
      !backupSignature ||
      !originalAddress ||
      !recipientAddress ||
      !deadline ||
      !tokenBalances ||
      !identifier ||
      !address
    ) {
      setError('Something is not defined...')
      return
    }

    const balances = await prepareTokenBalances(tokenBalances, provider, originalAddress)

    const recoveryInfo = {
      tokens: tokens,
      backupSignature: backupSignature,
      owner: originalAddress,
      recipient: recipientAddress,
      deadline: deadline,
      balances,
    }

    const signatureData = getPalRecoverySignatureData(1, recoveryInfo)
    if (!signatureData) {
      setError('error preparing signature data')
      return
    }

    const { domain, types, values } = signatureData

    try {
      // sign data here
      const signature = await signTypedDataAsync({
        // @ts-ignore
        domain,
        // @ts-ignore
        types,
        value: values,
      })
      await signRecovery(identifier, signature, address)
    } catch (e) {
      console.log(e)
    }

    setLoading(false)
    confirmRescue()
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
        <button style={{ color: '#4C82FB', cursor: 'pointer' }} onClick={onConfirm}>
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
