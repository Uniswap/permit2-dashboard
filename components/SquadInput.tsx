import { savePermitData } from '@/backend'
import { getBackupPermitData } from '@/backups'
import { BackupState } from '@/types'
import { resolveENS, useAccount } from '@/utils'
import styled from '@emotion/styled'
import { constants, Signer } from 'ethers'
import { useState } from 'react'
import { useNetwork, useProvider, useSigner, useSignTypedData } from 'wagmi'
import { Back } from './Back'
import { Input } from './Input'
import { StepTitle } from './StepTitle'

export function SquadInput({
  backup,
  setBackup,
  setStep,
}: {
  backup: BackupState
  setBackup: any
  setStep: (newStep: number) => void
}) {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const provider = useProvider()
  const [error, setError] = useState<string | null>(null)
  const [signing, setSigning] = useState(false)
  const { signTypedDataAsync } = useSignTypedData()

  const onChangeSquadMember = (index: number) => (newSquadMember: string) => {
    const newSquad = [...backup.squad]
    newSquad[index] = newSquadMember

    setBackup((prev: BackupState) => ({
      ...prev,
      squad: newSquad,
    }))
  }

  const onContinue = async () => {
    if (!chain || !signTypedDataAsync || !address) return

    const permitData = getBackupPermitData(chain.id, {
      pals: backup.squad,
      tokens: backup.tokens,
      threshold: constants.MaxUint256,
    })

    // some type of error handling here
    if (!permitData) return

    const { domain, types, values } = permitData
    try {
      setSigning(true)
      const signature = await signTypedDataAsync({
        // @ts-ignore uhhhhh
        domain,
        // @ts-ignore uhh fix this later
        types,
        // @ts-ignore uhhhh fix maybe?
        value: values,
      })

      const squad = await resolveENS(provider, backup.squad)
      await savePermitData(signature, squad, address, chain.id, backup.tokens)
      setStep(3)
    } catch (e) {
      setError('U FUCKED UP...')
    }
    setSigning(false)

    
  }

  return (
    <Container>
      <Back setStep={setStep} />
      <StepTitle index={2} title="Choose 3 wallets to act as your backup squad." />
      <Input
        title="Squad member 1"
        onChange={onChangeSquadMember(0)}
        value={backup.squad[0] ?? ''}
        placeholder="0x123.."
      />
      <Input
        title="Squad member 2"
        onChange={onChangeSquadMember(1)}
        value={backup.squad[1] ?? ''}
        placeholder="catt.eth"
      />
      <Input
        title="Squad member 3"
        onChange={onChangeSquadMember(2)}
        value={backup.squad[2] ?? ''}
        placeholder="0x123.."
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button disabled={backup.squad.length < 3} onClick={onContinue}>
        {signing ? 'Sign in wallet...' : 'Continue'}
      </button>
    </Container>
  )
}

const Container = styled.div`
  padding: 20px 48px 0 48px;
  gap: 20px;

  display: flex;
  flex-flow: column;
  overflow: hidden;
`
