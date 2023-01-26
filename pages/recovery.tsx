import { getPermitData } from '@/backend'
import { ConfirmStartRecovery } from '@/components/ConfirmStartRecovery'
import { Input } from '@/components/Input'
import { colors } from '@/styles/colors'
import styled from '@emotion/styled'
import { validateAndParseAddress } from '@uniswap/sdk-core'
import { useState } from 'react'
import { Card, useTokenBalances, WhiteDot } from '.'

type RecoveryData = {
  originalAddress: string | null
  recipientAddress: string | null
  status: string
  signatures: { [address: string]: string }
  squad: string[]
  backedUpTokenCount: number
  backedUpTokenValue: number
  permittedTokens: string[]
}

const initialRecoveryData = {
  originalAddress: null,
  recipientAddress: null,
  status: 'pending',
  signatures: {},
  squad: [],
  permittedTokens: [],
  backedUpTokenCount: 0,
  backedUpTokenValue: 0,
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
      />
      <Right step={step} />
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
}: {
  step: number
  setStep: (newStep: number) => void
  recoveryData: RecoveryData
  setRecoveryData: any
  backedUpTokens: string[]
  backedUpBalance: number
}) {
  if (step === 0) {
    return <StartRecovery setStep={setStep} recoveryData={recoveryData} setRecoveryData={setRecoveryData} />
  }

  if (step === 1) {
    return <ConfirmStartRecovery backedUpBalance={backedUpBalance} backedUpTokens={backedUpTokens} />
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

function Right({ step }: { step: number }) {
  if (step === 0) {
    return (
      <RightContainer>
        <Card>
          <WhiteDot />
          <div>🛟</div>
        </Card>
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

  const handleChange = (address: string) => {
    setRecoveryData((prev: RecoveryData) => ({
      ...prev,
      originalAddress: address,
    }))
  }

  const onContinue = async () => {
    if (!recoveryData.originalAddress || !validateAndParseAddress(recoveryData.originalAddress)) return

    setLoading(true)
    const backupData = await getPermitData(recoveryData.originalAddress.toLowerCase())
    const permitData = backupData.data.permits[0]
    console.log('permitData', permitData)

    setRecoveryData(
      (prev: RecoveryData) =>
        ({
          ...prev,
          signatures: permitData.signatures,
          squad: permitData.recoveryAddresses,
          permittedTokens: permitData.tokens.map((token: string) => token.toLowerCase()),
        } as RecoveryData)
    )

    // const backedUpTokens = permitData.tokens.map((token: string) => token.toLowerCase())
    // const filteredTokenBalances = tokenBalances.filter((tokenBalance: any) =>
    //   backedUpTokens.includes(tokenBalance.token.address.toLowerCase())
    // )
    // setBackedUpTokenCount(filteredTokenBalances.length)
    // const backedUpBalance = filteredTokenBalances.reduce(
    //   (sum: number, tokenBalance: any) => tokenBalance.denominatedValue.value + sum,
    //   0
    // )
    // setBackedUpBalance(backedUpBalance)
    // setSigners(permitData.recoveryAddresses)

    // fetch data about address here

    setStep(1)
  }

  return (
    <LeftContainer>
      <div style={{ fontSize: '68px' }}>
        Lost your keys?
        <br />
        <span style={{ color: colors.blue400 }}>Start a recovery.</span>
      </div>
      <div style={{ flex: 1 }}>
        <Input
          title="Original address"
          onChange={handleChange}
          value={recoveryData.originalAddress ?? ''}
          placeholder="0x123..."
        />
      </div>
      <button onClick={onContinue}>Continue</button>
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
  }

  overflow: hidden;
  flex: 1;
`
