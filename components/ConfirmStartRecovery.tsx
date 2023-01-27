import { formatNumber } from '@/format'
import { ethers } from 'ethers'
import { colors } from '@/styles/colors'
import { RecoveryData } from '@/types'
import styled from '@emotion/styled'
import Copy from '@/components/copy.svg'
import { useEffect, useState } from 'react'
import { getRecoveryData } from '@/backend'
import { getTokenBackups } from '@/contracts'
import { BACKUP_NONCE } from '@/backups';
import { useSigner } from 'wagmi'

const POLL_INTERVAL = 3000 // 3s

export function usePollRecovery(setRecoveryData: any, identifier?: string | null) {
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
  filteredTokenBalances,
}: {
  backedUpTokens: string[]
  backedUpBalance: number
  recoveryData: RecoveryData
  setRecoveryData: any
  filteredTokenBalances: any
}) {
  const { data: signer } = useSigner()
  const rescueLink = `https://token-backup-interface.vercel.app/rescue/${recoveryData.identifier}`
  const [copied, setCopied] = useState(false)
  const signaturesLeft = Math.max(
    0,
    (recoveryData.signaturesNeeded ?? 0) - Object.keys(recoveryData.signatures ?? {}).length
  )

  useEffect(() => {
    async function getData() {
      const res = await getRecoveryData(recoveryData.identifier ?? '')
      setRecoveryData((data: RecoveryData) => ({ ...data, deadline: res.data.deadline }))
    }

    getData()
  }, [recoveryData.identifier, setRecoveryData])

  const onCopy = () => {
    navigator.clipboard.writeText(rescueLink)
    setCopied(true)
  }

  const onRecover = async () => {
    if (
      !signer ||
      !recoveryData.backupSignature ||
      !recoveryData.deadline ||
      !recoveryData.originalAddress ||
      !recoveryData.recipientAddress
    ) {
      console.log('soemthings not defined', recoveryData.deadline, recoveryData)
      return
    }

    const contract = getTokenBackups(signer)

    const pals = recoveryData.signatures.map((pal) => ({
      sig: pal.signature,
      addr: pal.address,
      sigDeadline: recoveryData.deadline ?? '1',
    }))

    const permitted = recoveryData.permittedTokens.map((token) => {
      return {
        token,
        amount: ethers.constants.MaxUint256,
      }
    })

    const permitData = {
      permitted,
      nonce: BACKUP_NONCE,
      deadline: ethers.constants.MaxUint256,
    }

    const recoveryInfo = {
      oldAddress: recoveryData.originalAddress,
      transferDetails: permitted
        .map((permittedToken) => {
          let balance = ethers.utils.parseEther('0')
          for (const tokenBalanceData of filteredTokenBalances) {
            console.log(tokenBalanceData.token.address, permittedToken?.token)
            if (tokenBalanceData.token.address.toLowerCase() === permittedToken?.token.toLowerCase()) {
              balance = ethers.utils.parseUnits(String(tokenBalanceData.quantity))
            }
          }

          return {
            to: recoveryData.recipientAddress || '',
            requestedAmount: balance,
          }
        })
        .filter(Boolean),
    }
    const witnessData = {
      signers: recoveryData.signatures.map((pal) => pal.address),
      threshold: 2,
    }

    const res = await contract.recover(pals, recoveryData.backupSignature, permitData, recoveryInfo, witnessData, {
      gasLimit: 1000000,
    })
    console.log(res)
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
        <div style={{ color: colors.red, fontSize: '72px' }}>
          {signaturesLeft === 0 ? 'You got the sigs!' : 'Recovery in progress...'}
        </div>
        {signaturesLeft > 0 && <div style={{ fontSize: '40px' }}>Waiting for {signaturesLeft} signers</div>}
        {signaturesLeft === 0 && <button onClick={onRecover}>Recover</button>}
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
