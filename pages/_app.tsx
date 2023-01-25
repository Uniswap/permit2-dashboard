import '../styles/globals.css'

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
          embedGoogleFonts: true,
        }}
        theme="soft"
        customTheme={{
          '--ck-font-family': 'Fredoka',
          '--ck-modal-heading-font-weight': 400,
          '--ck-connectbutton-color': colors.green400,
          '--ck-connectbutton-hover-background': colors.yellow100,
          '--ck-connectbutton-background': colors.yellow100,
          '--ck-connectbutton-active-background': colors.yellow100,
          '--ck-connectbutton-box-shadow': `inset 0 0 0 2px ${colors.yellow400},0 2px 0 0 ${colors.yellow400},0px 2px 4px rgba(0,0,0,0.02)`,
          '--ck-connectbutton-active-box-shadow': `inset 0 0 0 2px ${colors.yellow400},0 2px 0 0 ${colors.yellow400},0px 2px 4px rgba(0,0,0,0.02)`,
        }}
      >
        <ApolloProvider client={apolloClient}>
          <HeaderNav />
          <Component {...pageProps} />
        </ApolloProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}
