import { fromGraphQLChain, useAccount } from '@/utils'
import styled from '@emotion/styled'
import { gql, useQuery } from '@apollo/client'

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
      }
    }
  }
`

function TokenBalances() {
  const { address, chain } = useAccount()
  console.log('address', address)
  const { loading, data, error } = useQuery(tokenBalancesGql, { variables: { ownerAddress: address }, skip: !address })
  console.log('data', data)
  console.log('error', error)
  console.log('loading', loading)

  const currentChainTokens = data?.portfolios[0]?.tokenBalances.filter(
    (tokenBalance: any) => fromGraphQLChain(tokenBalance.token.chain) === chain?.id
  )

  console.log('currentChainTokens', currentChainTokens)

  if (loading) return <div>Loading token balances...</div>
  return (
    <div>
      Your tokens
      <br />
      {!currentChainTokens || (currentChainTokens.length === 0 && 'You have no tokens :(')}
      {currentChainTokens?.map((tokenBalance: any) => (
        <TokenRow key={tokenBalance.id}>
          <div>{tokenBalance.quantity}</div>
          <div>{tokenBalance.token.name}</div>
        </TokenRow>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div>
      <TokenBalances />
    </div>
  )
}

const TokenRow = styled.div`
  display: flex;
  gap: 10px;
`
