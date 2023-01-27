import { getRecoveryData } from '@/backend'
import { colors } from '@/styles/colors'
import styled from '@emotion/styled'
import { useEffect, useState } from 'react'
import { RecoveryData } from '@/types'
import Image from 'next/image'
import { useEnsName } from 'wagmi'
import { useRouter } from 'next/router'
import { useAccount } from '@/utils'
import { RescueStatus } from '@/components/RescueStatus'
import { RescueModal } from '@/components/RescueModal'
import { useTokenBalances } from '..'

const initialRecoveryData = {
  originalAddress: null,
  recipientAddress: null,
  status: 'pending',
  signatures: {},
  squad: [],
  permittedTokens: [],
  backedUpTokenCount: 0,
  backedUpTokenValue: 0,
  identifier: null,
}

export default function Rescue() {
  const [showModal, setShowModal] = useState(false)
  const [recoveryData, setRecoveryData] = useState<any>(initialRecoveryData)
  const address = useAccount().address
  const router = useRouter()
  const { id } = router.query

  const confirmRescue = () => {
    console.log('rescue')
  }

  const tokenBalances = useTokenBalances(recoveryData.originalAddress, 1)

  useEffect(() => {
    async function getData() {
      if (address && id) {
        const request = await getRecoveryData(id as string)
        const fetchedRecoveryData = request.data

        setRecoveryData((prev: RecoveryData) => ({
          ...prev,
          squad: fetchedRecoveryData.recoveryAddresses,
          originalAddress: fetchedRecoveryData.owner,
          signatures: fetchedRecoveryData.signatures,
          recipientAddress: fetchedRecoveryData.recipientAddress,
        }))
      }
    }
    getData()
  }, [address, id])

  if (!recoveryData.squad || !address || !id) {
    return <RecoveryContainer />
  }

  return (
    <RecoveryContainer>
      <RescueModal
        tokenBalances={tokenBalances}
        recipientAddress={recoveryData.recipientAddress}
        showModal={showModal}
        setShowModal={setShowModal}
        confirmRescue={confirmRescue}
      />
      <Left recoveryData={recoveryData} showModal={showModal} setShowModal={setShowModal} />
      <Right signers={recoveryData.squad} signed={Object.keys(recoveryData.signatures)} id={(id as string) ?? ''} />
    </RecoveryContainer>
  )
}

function Left({
  recoveryData,
  showModal,
  setShowModal,
}: {
  recoveryData: RecoveryData
  showModal: boolean
  setShowModal: (arg0: boolean) => void
}) {
  return <RescueStatus recoveryData={recoveryData} showModal={showModal} setShowModal={setShowModal} />
}

const RightContainer = styled.div`
  justify-content: flex-end;
  display: flex;
  flex-flow: column;
  margin-left: 48px;
`

function RecoveryAddressCard({ signer, index, isSigned }: { signer: string; index: number; isSigned: boolean }) {
  // @ts-ignore
  const { data: ensName } = useEnsName({ address: signer, chainId: 1 })
  const cardColors = [colors.green, colors.gold, colors.purple]
  return (
    <div>
      <div
        style={{
          backgroundColor: isSigned ? cardColors[index % cardColors.length] : colors.gray300,
          padding: '10px',
          margin: '5px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          fontSize: '50px',
          alignSelf: 'flex-end',
          borderRadius: '100px 0 0 100px',
          color: 'white',
          width: '1000px',
        }}
      >
        <Image src="/icon.png" height={115} width={115} alt="Flower icon" />
        <div style={{ marginLeft: '24px' }}>{ensName ?? signer}</div>
      </div>
    </div>
  )
}

const CardButton = styled.div`
  background-color: ${colors.gray350};
  padding: 20px;
  border: none;
  border-radius: 100px 0 0 100px;
  display: flex;
  flex-flow: column;
  justify-content: space-between;

  font-size: 60px;
  color: white;
  width: 100%;
  align-self: flex-end;
`

function BackupIdCard({ id }: { id: string }) {
  return (
    <CardButton>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ backgroundColor: 'white', height: '115px', width: '115px', borderRadius: '100%' }} />
        <div style={{ color: 'white', marginLeft: '24px', opacity: 0.4 }}>🛟 {id}</div>
      </div>
    </CardButton>
  )
}

function Right({ signers, signed, id }: { signers: string[]; signed: string[]; id: string }) {
  return (
    <RightContainer>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ alignSelf: 'flex-end' }}>
          {signers.map((signer, i) => {
            return <RecoveryAddressCard isSigned={signed.includes(signer)} signer={signer} index={i} key={i} />
          })}
          <BackupIdCard id={id} />
        </div>
      </div>
    </RightContainer>
  )
}

const RecoveryContainer = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row;
  > div {
    width: 50%;
    box-sizing: border-box;
    max-width: 50%;
    overflow: hidden;
  }

  overflow: hidden;
  flex: 1;
`
