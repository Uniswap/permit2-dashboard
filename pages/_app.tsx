import '../styles/globals.css'

import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import type { AppProps } from 'next/app'
import { goerli, configureChains, createClient, WagmiConfig, mainnet } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { colors } from '../styles/colors'

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
    appName: 'permit2 dashboard',
    alchemyId,
    chains,
    provider,
  })
)

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
        <Component {...pageProps} />
      </ConnectKitProvider>
    </WagmiConfig>
  )
}
