import { colors } from '@/styles/colors'
import styled from '@emotion/styled'
import { useEffect, useState } from 'react'
import { useTokenBalances } from '.'
import Link from 'next/link'
import Icon from '../public/icon.png'

import { useAccount } from '@/utils'
import { formatNumber } from '@/format'
import { getPermitData } from '@/backend'

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

const RecoveryStackContainer = styled.div`
  padding: 20px 48px 0 48px;
  color: white;

  > div {
    border-radius: 100px;
    font-size: 20px;
  }

  display: flex;
  flex-flow: column;
`

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

function RecoveryAddressCard({ signer, index }: { signer: string; index: number }) {
  const cardColors = [colors.green, colors.gold, colors.purple]
  return (
    <div>
      <div
        style={{
          backgroundColor: cardColors[index % cardColors.length],
          padding: '10px',
          margin: '5px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          fontSize: '50px',
          alignSelf: 'flex-end',
          borderRadius: '100px 0 0 100px',
          width: '1000px',
          color: 'white',
        }}
      >
        <img src={Icon.src} style={{ marginLeft: '10px', height: '115px', width: '115px' }} />
        <div style={{ marginLeft: '100px' }}>{signer}</div>
      </div>
    </div>
  )
}

function BackupIdCard() {
  return (
    <CardButton>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ backgroundColor: 'white', height: '115px', width: '115px', borderRadius: '100%' }} />
        <div style={{ color: 'white', opacity: '.2', marginLeft: '100px' }}>callous-iceman</div>
      </div>
    </CardButton>
  )
}

function RightStack({ signers }: { signers: string[] }) {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ alignSelf: 'flex-end' }}>
        {signers.map((signer, i) => {
          return <RecoveryAddressCard signer={signer} index={i} key={i} />
        })}
        <BackupIdCard />
      </div>
    </div>
  )
}

function LeftStack({ backedUpBalance, backedUpTokenCount }: { backedUpBalance: number; backedUpTokenCount: number }) {
  return (
    <RecoveryStackContainer>
      <Link href="/" legacyBehavior>
        <div
          style={{
            marginTop: '50px',
            padding: '10px',
            alignItems: 'center',
            fontSize: '24px',
            color: colors.black,
            opacity: 0.2,
            cursor: 'pointer',
          }}
        >
          back
        </div>
      </Link>
      <div
        style={{
          padding: '10px',
          alignItems: 'center',
          fontSize: '72px',
          color: colors.black,
        }}
      >
        {backedUpTokenCount} tokens worth ${formatNumber(backedUpBalance)} currently backed up
      </div>
      <div
        style={{
          padding: '10px',
          alignItems: 'center',
          fontSize: '44px',
          color: colors.blue400,
          cursor: 'pointer',
        }}
      >
        Start a recovery
      </div>
      <div
        style={{
          padding: '10px',
          alignItems: 'center',
          fontSize: '22px',
          color: colors.blue400,
          opacity: 0.4,
        }}
      >
        Share: https://supertokenbackerupper.com
      </div>
    </RecoveryStackContainer>
  )
}

export default function Recovery2() {
  const [backupData, setBackupData] = useState<any>({})
  const [address, setAddress] = useState("")
  const tokenBalances = useTokenBalances(address)

  const [backedUpBalance, setBackedUpBalance] = useState<number>(0)
  const [backedUpTokenCount, setBackedUpTokenCount] = useState<number>(0)
  const [signers, setSigners] = useState<string[]>([])

  useEffect(() => {
    async function getData() {
      if (address && tokenBalances) {
        const backupData = await getPermitData(address)
        const permitData = backupData.data.permits[0]
        setBackupData(permitData)
        const backedUpTokens = permitData.tokens.map((token: string) => token.toLowerCase())
        const filteredTokenBalances = tokenBalances.filter((tokenBalance: any) =>
          backedUpTokens.includes(tokenBalance.token.address.toLowerCase())
        )
        setBackedUpTokenCount(filteredTokenBalances.length)
        const backedUpBalance = filteredTokenBalances.reduce(
          (sum: number, tokenBalance: any) => tokenBalance.denominatedValue.value + sum,
          0
        )
        setBackedUpBalance(backedUpBalance)
        setSigners(permitData.recoveryAddresses)
      }
    }
    // Update the document title using the browser API
    getData()
  }, [address, tokenBalances])

  if (Object.keys(backupData).length <= 0) {
    return <RecoveryContainer />
  }

  return (
    <RecoveryContainer>
      <LeftStack backedUpBalance={backedUpBalance} backedUpTokenCount={backedUpTokenCount} />
      <RightStack signers={signers} />
    </RecoveryContainer>
  )
}
