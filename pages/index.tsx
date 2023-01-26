import { EMPTY_ARRAY, fromGraphQLChain, isNativeCurrencyAddress, useAccount } from '@/utils'
import styled from '@emotion/styled'
import { gql, useQuery } from '@apollo/client'
import { colors } from '@/styles/colors'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BackupState } from '@/types'
import { TokenSelector } from '@/components/TokenSelector'
import { useProvider } from 'wagmi'
import { getTokenContract, PERMIT2_CONTRACT_ADDRESS } from '@/contracts'
import { SquadInput } from '@/components/SquadInput'
import { SetupComplete } from '@/components/SetupComplete'
import { useModal } from 'connectkit'
import randomWords from 'random-words'

const tokenBalancesGql = gql`
  query PortfolioBalances($ownerAddress: String!) {
    portfolios(ownerAddresses: [$ownerAddress]) {
      id
      tokenBalances {
        id
        quantity
        denominatedValue {
          id
          currency
          value
        }
        token {
          id
          chain
          address
          name
          symbol
          decimals
        }
        tokenProjectMarket {
          tokenProject {
            logoUrl
          }
        }
      }
    }
  }
`

export function useTokenBalances() {
  const { address, chain } = useAccount()
  const { data } = useQuery(tokenBalancesGql, { variables: { ownerAddress: address }, skip: !address })

  return useMemo(
    () =>
      data?.portfolios[0]?.tokenBalances.filter((tokenBalance: any) => {
        const tokenChain = fromGraphQLChain(tokenBalance.token.chain)
        return (
          tokenChain === chain?.id &&
          // doesnt work with ETH rn :(
          !isNativeCurrencyAddress(tokenChain, tokenBalance.token.address)
        )
      }),
    [data, chain?.id]
  )
}

const IntroStackContainer = styled.div`
  padding: 20px 48px 0 48px;
  color: white;

  > div {
    border-radius: 100px;
    font-size: 20px;
  }

  display: flex;
  flex-flow: column;
`

function IntroStack({ setStep, setBackup }: { setStep: (newStep: number) => void; setBackup: any }) {
  const { isConnected } = useAccount()
  const { setOpen } = useModal()
  const handleClick = () => {
    if (!isConnected) {
      setOpen(true)
      return
    }

    const identifier = randomWords({ exactly: 5, wordsPerString: 2, separator: '-' })[0]
    setBackup((backup: BackupState) => ({
      ...backup,
      identifier,
    }))

    setStep(1)
  }

  return (
    <IntroStackContainer>
      <div
        style={{
          backgroundColor: colors.red,
          padding: '40px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          fontSize: '24px',
        }}
      >
        With SuperTokenBackerUpper, if you ever lose access to your wallet, you can recover any tokens that got stuck!
      </div>
      <div style={{ backgroundColor: colors.green, padding: '36px' }}>1. Set up a new backup</div>
      <div style={{ backgroundColor: colors.green, padding: '36px' }}>
        2. Add anyone to help you keep your backups fresh!
      </div>
      <div style={{ backgroundColor: colors.green, padding: '36px' }}>
        3. Recover with friends any time you lose access.
      </div>
      <button style={{ fontSize: '24px' }} onClick={handleClick}>
        Make a backup
      </button>
    </IntroStackContainer>
  )
}

const RightStackContainer = styled.div`
  position: relative;
`

const Card = styled.div`
  background-color: ${colors.gray350};
  position: absolute;
  bottom: 0;
  right: 0;
  left: 48px;
  height: 62%;
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;

  padding: 52px 48px;
  display: flex;
  flex-flow: column;
  justify-content: space-between;

  font-size: 72px;
  color: white;
`

const CardButton = styled.button`
  background-color: ${colors.gray350};
  border: none;
  cursor: pointer;
  position: absolute;
  bottom: 0;
  right: 0;
  left: 48px;
  height: 62%;
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;

  padding: 52px 48px;
  display: flex;
  flex-flow: column;
  justify-content: space-between;

  font-size: 72px;
  color: white;

  &:hover {
    opacity: 80%;
  }
`

export const WhiteDot = styled.div`
  border-radius: 50%;
  width: 80px;
  height: 80px;
  background-color: white;
`

function StartCard() {
  return (
    <Card>
      <WhiteDot />
      <div>🤝</div>
    </Card>
  )
}

function InProgressCard({ identifier }: { identifier: string }) {
  return (
    <Card>
      <WhiteDot />
      <div style={{ color: colors.gray100, display: 'flex', flexFlow: 'column' }}>
        <div style={{ fontSize: '14px', lineHeight: '16px' }}>Your backup identifier</div>
        <div>{identifier}</div>
      </div>
    </Card>
  )
}

function RightStack({
  step,
  setStep,
  backup,
  setBackup,
}: {
  step: number
  setStep: (step: number) => void
  backup: BackupState
  setBackup: any
}) {
  return (
    <RightStackContainer>
      {step === 0 && <StartCard />}
      {step >= 1 && backup.identifier && <InProgressCard identifier={backup.identifier} />}
    </RightStackContainer>
  )
}

function LeftStack({
  step,
  setStep,
  backup,
  setBackup,
  tokenBalances,
  permit2Approvals,
}: {
  step: number
  setStep: (step: number) => void
  backup: BackupState
  setBackup: (newState: BackupState) => void
  // TODO: type this lol
  tokenBalances: any
  permit2Approvals: { approved: string[]; loading: boolean; refetch: () => void }
}) {
  if (step === 0) {
    return <IntroStack setBackup={setBackup} setStep={setStep} />
  }

  if (step === 1) {
    return (
      <TokenSelector
        permit2Approvals={permit2Approvals}
        tokenBalances={tokenBalances}
        backup={backup}
        setBackup={setBackup}
        setStep={setStep}
      />
    )
  }

  if (step === 2) {
    return <SquadInput backup={backup} setBackup={setBackup} setStep={setStep} />
  }

  if (step === 3) {
    return <SetupComplete tokenBalances={tokenBalances} backup={backup} />
  }

  return <div />
}

const initialBackupState: BackupState = {
  squad: [],
  tokens: [],
  signature: null,
  identifier: null,
}

// Get a list of token addresses that have a non-zero allowance on Permit2
function usePermit2Approvals(tokenBalances: any) {
  const tokens = useMemo(
    () => tokenBalances?.map((balance: any) => balance.token.address) ?? EMPTY_ARRAY,
    [tokenBalances]
  )
  const [approved, setApproved] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const provider = useProvider()
  const { address } = useAccount()

  const getData = useCallback(async () => {
    if (!address) return

    const newApproved = []
    for (var i = 0; i < tokens.length; i++) {
      const contract = getTokenContract(tokens[i], provider)
      const allowance = await contract.allowance(address, PERMIT2_CONTRACT_ADDRESS)
      if (allowance.gt(0)) {
        newApproved.push(tokens[i])
      }
    }

    setApproved(newApproved)
    setLoading(false)
  }, [address, provider, tokens])

  useEffect(() => {
    getData()
  }, [getData])

  return { approved, loading, refetch: getData }
}

export default function Home() {
  const [step, setStep] = useState<number>(0)
  const [backup, setBackup] = useState<BackupState>(initialBackupState)
  const tokenBalances = useTokenBalances()
  const permit2Approvals = usePermit2Approvals(tokenBalances)

  return (
    <HomeContainer>
      <LeftStack
        step={step}
        setStep={setStep}
        backup={backup}
        setBackup={setBackup}
        tokenBalances={tokenBalances}
        permit2Approvals={permit2Approvals}
      />
      <RightStack step={step} setStep={setStep} backup={backup} setBackup={setBackup} />
    </HomeContainer>
  )
}

const HomeContainer = styled.div`
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
