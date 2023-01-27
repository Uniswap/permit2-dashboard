import { getPermitData, startRecovery } from '@/backend'
import { ConfirmStartRecovery } from '@/components/ConfirmStartRecovery'
import { Input } from '@/components/Input'
import { colors } from '@/styles/colors'
import styled from '@emotion/styled'
import { validateAndParseAddress } from '@uniswap/sdk-core'
import { useState } from 'react'
import { Card, useTokenBalances, WhiteDot } from '.'
import randomWords from 'random-words'
import { RecoveryData } from '@/types'
import Image from 'next/image'
import { useEnsName } from 'wagmi'

const initialRecoveryData = {
  originalAddress: null,
  recipientAddress: null,
  status: 'pending',
  signatures: [],
  squad: [],
  permittedTokens: [],
  backedUpTokenCount: 0,
  backedUpTokenValue: 0,
  identifier: null,
  tokens: [],
  backupSignature: '',
  deadline: null,
  signaturesNeeded: null,
}

export default function Recovery() {
  const [step, setStep] = useState(0)
  const [recoveryData, setRecoveryData] = useState<RecoveryData>(initialRecoveryData)
  const tokenBalances = useTokenBalances(recoveryData.originalAddress, 1 /* default to mainnet */)
  const backedUpTokens = recoveryData.permittedTokens.map((token: string) => token.toLowerCase())
  const filteredTokenBalances = tokenBalances?.filter((tokenBalance: any) =>
    backedUpTokens.includes(tokenBalance.token.address.toLowerCase())
  )
  const backedUpBalance =
    filteredTokenBalances?.reduce((sum: number, tokenBalance: any) => tokenBalance.denominatedValue.value + sum, 0) ?? 0

  return (
    <RecoveryContainer>
      <Left
        step={step}
        setStep={setStep}
        backedUpTokens={backedUpTokens}
        backedUpBalance={backedUpBalance}
        recoveryData={recoveryData}
        setRecoveryData={setRecoveryData}
        filteredTokenBalances={filteredTokenBalances}
      />
      <Right step={step} signers={recoveryData.squad} signed={Object.keys(recoveryData.signatures)} />
    </RecoveryContainer>
  )
}

function Left({
  step,
  setStep,
  recoveryData,
  setRecoveryData,
  backedUpTokens,
  backedUpBalance,
  filteredTokenBalances
}: {
  step: number
  setStep: (newStep: number) => void
  recoveryData: RecoveryData
  setRecoveryData: any
  backedUpTokens: string[]
  backedUpBalance: number
  filteredTokenBalances: any
}) {
  if (step === 0) {
    return <StartRecovery setStep={setStep} recoveryData={recoveryData} setRecoveryData={setRecoveryData} />
  }

  if (step === 1) {
    return (
      <ConfirmStartRecovery
        setRecoveryData={setRecoveryData}
        recoveryData={recoveryData}
        backedUpBalance={backedUpBalance}
        backedUpTokens={backedUpTokens}
        filteredTokenBalances={filteredTokenBalances}
      />
    )
  }

  return <div />
}
const LeftContainer = styled.div`
  padding: 20px 48px;
  gap: 20px;

  display: flex;
  flex-flow: column;
  overflow: hidden;
`

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

function BackupIdCard() {
  return (
    <CardButton>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ backgroundColor: 'white', height: '115px', width: '115px', borderRadius: '100%' }} />
        <div style={{ color: 'white', marginLeft: '24px' }}>🛟</div>
      </div>
    </CardButton>
  )
}

function Right({ step, signers, signed }: { step: number; signers: string[]; signed: string[] }) {
  if (step === 0) {
    return (
      <RightContainer>
        <Card>
          <WhiteDot />
          <div>🛟 Recover</div>
        </Card>
      </RightContainer>
    )
  }

  if (step === 1) {
    return (
      <RightContainer>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ alignSelf: 'flex-end' }}>
            {signers.map((signer, i) => {
              return <RecoveryAddressCard isSigned={signed.includes(signer)} signer={signer} index={i} key={i} />
            })}
            <BackupIdCard />
          </div>
        </div>
      </RightContainer>
    )
  }

  return <div />
}

function StartRecovery({
  setStep,
  recoveryData,
  setRecoveryData,
}: {
  setStep: (a: number) => void
  recoveryData: RecoveryData
  setRecoveryData: any
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOriginalAddressChange = (address: string) => {
    setRecoveryData((prev: RecoveryData) => ({
      ...prev,
      originalAddress: address,
    }))
  }

  const handleRecipientAddressChange = (address: string) => {
    setRecoveryData((prev: RecoveryData) => ({
      ...prev,
      recipientAddress: address,
    }))
  }

  const onContinue = async () => {
    if (
      !recoveryData.originalAddress ||
      !validateAndParseAddress(recoveryData.originalAddress) ||
      !recoveryData.recipientAddress ||
      !validateAndParseAddress(recoveryData.recipientAddress)
    )
      return

    setLoading(true)
    const backupData = await getPermitData(recoveryData.originalAddress)
    const permitData = backupData.data.permits[0]

    if (!permitData) {
      setError('No backups found.')
      return
    }

    const recoveryId = randomWords({ exactly: 5, wordsPerString: 2, separator: '-' })[0]

    setRecoveryData(
      (prev: RecoveryData) =>
        ({
          ...prev,
          squad: permitData.recoveryAddresses,
          permittedTokens: permitData.tokens.map((token: string) => token.toLowerCase()),
          identifier: recoveryId,
          signaturesNeeded: permitData.recoveryScheme.m,
        } as RecoveryData)
    )

    // generate random words to be used for link
    await startRecovery(recoveryData.originalAddress, recoveryData.recipientAddress, recoveryId)
    setStep(1)
  }

  return (
    <LeftContainer>
      <div style={{ fontSize: '68px' }}>
        Lost your keys?
        <br />
        <span style={{ color: colors.blue400 }}>Start a recovery.</span>
      </div>
      <div style={{ display: 'flex', flexFlow: 'column', gap: '12px', flex: 1 }}>
        <Input
          title="Original address"
          onChange={handleOriginalAddressChange}
          value={recoveryData.originalAddress ?? ''}
          placeholder="0x123..."
        />
        <Input
          title="New address"
          onChange={handleRecipientAddressChange}
          value={recoveryData.recipientAddress ?? ''}
          placeholder="0x123..."
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button disabled={!recoveryData.recipientAddress || !recoveryData.originalAddress} onClick={onContinue}>
        Continue
      </button>
    </LeftContainer>
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
