import { getTokenContract, PERMIT2_CONTRACT_ADDRESS } from '@/contracts'
import { formatNumber, NumberType } from '@/format'
import { colors } from '@/styles/colors'
import { BackupState } from '@/types'
import styled from '@emotion/styled'
import { useProvider, useSigner } from 'wagmi'
import { StepTitle } from './StepTitle'
import { constants } from 'ethers'
import { useState } from 'react'

function getApprovedValue(approved: string[], tokenBalances: any) {
  if (!tokenBalances) return 0

  let sum = 0
  for (var i = 0; i < tokenBalances.length; i++) {
    sum += tokenBalances[i].denominatedValue.value
  }

  return sum
}

export function TokenSelector({
  backup,
  setBackup,
  tokenBalances,
  permit2Approvals,
}: {
  backup: BackupState
  setBackup: (newState: BackupState) => void
  tokenBalances: any
  permit2Approvals: { approved: string[]; loading: boolean; refetch: () => void }
}) {
  const approvedValue = getApprovedValue(permit2Approvals.approved, tokenBalances)
  return (
    <Container>
      <StepTitle
        index={1}
        title={`Allow tokens to be backed up (Total value: ${formatNumber(approvedValue, NumberType.FiatTokenPrice)})`}
      />
      <Tokens tokenBalances={tokenBalances} permit2Approvals={permit2Approvals} />
      <button disabled={!tokenBalances?.length}>Continue</button>
    </Container>
  )
}

const Token = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2px;
  background-color: ${colors.gray100};
  border-radius: 100px;
  padding: 8px 20px;

  img {
    height: 40px;
    width: 40px;
    border-radius: 50%;
  }
`

const TokenDetails = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2px;

  > div {
    display: flex;
    align-items: center;
  }
`

function Tokens({
  tokenBalances,
  permit2Approvals,
}: {
  tokenBalances: any
  permit2Approvals: { approved: string[]; loading: boolean; refetch: () => void }
}) {
  const { data: signer } = useSigner()
  const [approveLoading, setApproveLoading] = useState<{ [address: string]: boolean }>({})

  if (permit2Approvals.loading) return null
  if (!tokenBalances) return <div>You have no tokens. ngmi</div>

  const onApprove = (tokenAddress: string) => async () => {
    if (!signer) return

    const contract = getTokenContract(tokenAddress, signer)

    try {
      const res = await contract.approve(PERMIT2_CONTRACT_ADDRESS, constants.MaxUint256)

      setApproveLoading((prev) => ({ ...prev, [tokenAddress]: true }))
      await res.wait()
    } catch (e) {}

    setApproveLoading((prev) => ({ ...prev, [tokenAddress]: false }))
    permit2Approvals.refetch()
  }

  return (
    <TokenList>
      {tokenBalances?.map((tokenBalance: any) => (
        <Token key={tokenBalance.id}>
          <TokenDetails>
            <div>
              {tokenBalance.tokenProjectMarket.tokenProject.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  style={{ marginRight: '5px' }}
                  src={tokenBalance.tokenProjectMarket.tokenProject.logoUrl}
                  alt="Token logo"
                />
              )}
            </div>
            <div style={{ display: 'flex', flexFlow: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ fontWeight: 'bold' }}>{tokenBalance.token.symbol}</div>
              <div>
                {formatNumber(tokenBalance.quantity, NumberType.TokenNonTx)} (
                {formatNumber(tokenBalance.denominatedValue.value, NumberType.FiatTokenPrice)})
              </div>
            </div>
          </TokenDetails>
          <div style={{ color: colors.gray300 }}>
            {permit2Approvals.approved.includes(tokenBalance.token.address) && 'Approved'}
          </div>
          {!permit2Approvals.approved.includes(tokenBalance.token.address) && (
            <button onClick={onApprove(tokenBalance.token.address)}>
              {approveLoading[tokenBalance.token.address] ? 'Approving...' : 'Approve'}
            </button>
          )}
        </Token>
      ))}
    </TokenList>
  )
}

const TokenList = styled.div`
  display: flex;
  flex-flow: column;
  gap: 8px;
  overflow-y: scroll;
`

const Container = styled.div`
  padding: 20px 48px 0 48px;
  gap: 20px;

  display: flex;
  flex-flow: column;
  overflow: hidden;
`
