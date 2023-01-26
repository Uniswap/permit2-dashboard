import '../styles/globals.css'
import styled from '@emotion/styled'

import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import type { AppProps } from 'next/app'
import { goerli, configureChains, createClient, WagmiConfig, mainnet } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { HeaderNav } from '../components/HeaderNav'
import { colors } from '../styles/colors'
import { ApolloClient, ApolloProvider, createHttpLink, from, InMemoryCache } from '@apollo/client'

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID
if (!alchemyId) {
  throw new Error('Must specify an Alchemy ID')
}

const { chains, provider } = configureChains(
  [mainnet, goerli],
  [alchemyProvider({ apiKey: alchemyId }), publicProvider()]
)

const wagmiClient = createClient(
  getDefaultClient({
    appName: 'token backup',
    alchemyId,
    chains,
    provider,
  })
)

if (!process.env.NEXT_PUBLIC_UNISWAP_API_KEY) {
  throw new Error('Uniswap API key not set')
}

const httpLink = createHttpLink({
  uri: 'https://api.uniswap.org/v1/graphql',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.NEXT_PUBLIC_UNISWAP_API_KEY,
    Origin: 'https://api.uniswap.org',
  },
})

const apolloClient = new ApolloClient({
  link: from([httpLink]),
  cache: new InMemoryCache(),
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <ConnectKitProvider
        options={{
          walletConnectName: 'WalletConnect',
        }}
        theme="soft"
        customTheme={{
          '--ck-font-family': 'Replica',
          '--ck-modal-heading-font-weight': 400,
          '--ck-connectbutton-color': colors.black,
          '--ck-connectbutton-hover-background': colors.yellow100,
          '--ck-connectbutton-background': colors.yellow100,
          '--ck-connectbutton-active-background': colors.yellow100,
          '--ck-connectbutton-box-shadow': `inset 0 0 0 2px ${colors.black},0 2px 0 0 ${colors.black},0px 2px 4px rgba(0,0,0,0.02)`,
          '--ck-connectbutton-active-box-shadow': `inset 0 0 0 2px ${colors.black},0 2px 0 0 ${colors.black},0px 2px 4px rgba(0,0,0,0.02)`,
        }}
      >
        <ApolloProvider client={apolloClient}>
          <MaxHeightContainer>
            <HeaderNav />
            <Component {...pageProps} />
            <BottomShadow />
          </MaxHeightContainer>
        </ApolloProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}

function BottomShadow() {
  return (
    <BottomShadowContainer>
      <div>
        <Card />
      </div>
      <div>
        <Card style={{ borderTopRightRadius: 0, right: 0 }} />
      </div>
    </BottomShadowContainer>
  )
}

const BottomShadowContainer = styled.div`
  background-color: ${colors.gray100};
  height: 40px;
  width: 100%;

  display: flex;
  > div {
    flex: 1;
    padding: 0 48px;
    position: relative;
  }
`

const Card = styled.div`
  position: absolute;
  top: 0;
  left: 48px;
  right: 48px;
  bottom: 0;
  background-color: ${colors.gray150};
  border-top-right-radius: 100px;
  border-top-left-radius: 100px;
`

const MaxHeightContainer = styled.div`
  max-height: 100vh;
  height: 100vh;

  display: flex;
  flex-flow: column;
`