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

export function useTokenBalances(address: string | null | undefined, chainId: number = 1) {
  const { data } = useQuery(tokenBalancesGql, { variables: { ownerAddress: address }, skip: !address })

  return useMemo(
    () =>
      data?.portfolios[0]?.tokenBalances.filter((tokenBalance: any) => {
        const tokenChain = fromGraphQLChain(tokenBalance.token.chain)
        return (
          tokenChain === chainId &&
          // doesnt work with ETH rn :(
          !isNativeCurrencyAddress(tokenChain, tokenBalance.token.address)
        )
      }),
    [data, chainId]
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
  justify-content: flex-end;
  display: flex;
  flex-flow: column;
  margin-left: 48px;
`

export const Card = styled.div`
  background-color: ${colors.gray350};
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;
  min-height: 250px;

  padding: 48px 48px;
  display: flex;
  flex-flow: column;
  justify-content: space-between;

  font-size: 72px;
  color: white;

  transition: height 0.2s ease-in;
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

const SquadMember = styled.div`
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;
  background-color: ${colors.blue400};
  padding: 32px 48px;
  font-size: 24px;
  color: white;
  animation: slide-in-right 0.5s ease-out;
`

const backgroundColors: { [index: string]: string } = {
  '0': colors.green,
  '1': colors.gold,
  '2': colors.purple,
}

function InProgress({ identifier, backup, step }: { identifier: string; backup: BackupState; step: number }) {
  return (
    <div style={{ display: 'flex', flexFlow: 'column', gap: '8px' }}>
      {backup.squad.map((squadMember, i) => (
        <SquadMember style={{ backgroundColor: backgroundColors[String(i)] }} key={i}>
          <div>{squadMember}</div>
        </SquadMember>
      ))}
      <InProgressCard identifier={identifier} backup={backup} step={step} />
    </div>
  )
}

function InProgressCard({ identifier, backup, step }: { identifier: string; backup: BackupState; step: number }) {
  const height = 250 - backup.squad.length * 50
  if (step === 1) {
    return (
      <Card style={{ minHeight: height, height: height }}>
        {height >= 200 ? <WhiteDot /> : <div />}
        <div style={{ color: colors.gray100, display: 'flex', flexFlow: 'column' }}>
          <div>Approve tokens</div>
          <div style={{ fontSize: '14px', lineHeight: '16px' }}>
            Any token that is approved through Permit2 can be eligible to be rescued by your squad.
          </div>
        </div>
      </Card>
    )
  }

  if (step === 2)
    return (
      <Card style={{ minHeight: height, height: height }}>
        {height >= 200 ? <WhiteDot /> : <div />}
        <div style={{ color: colors.gray100, display: 'flex', flexFlow: 'column' }}>
          <div>Choose your squad</div>

          <div style={{ fontSize: '14px', lineHeight: '16px' }}>
            You will need 2 out of 3 squad members to rescue you. You can use other addresses that you own.
          </div>
        </div>
      </Card>
    )

  return (
    <Card style={{ minHeight: height, height: height }}>
      {height >= 200 ? <WhiteDot /> : <div />}
      <div style={{ color: colors.gray100, display: 'flex', flexFlow: 'column' }}>
        <div>Done!</div>
        <div style={{ fontSize: '14px', lineHeight: '16px' }}>
          You can now rescue tokens in case you lose access to your private key.
        </div>
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
      {step >= 1 && backup.identifier && <InProgress step={step} backup={backup} identifier={backup.identifier} />}
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
  const { address, chain } = useAccount()
  const [backup, setBackup] = useState<BackupState>(initialBackupState)
  const tokenBalances = useTokenBalances(address, chain?.id)
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
