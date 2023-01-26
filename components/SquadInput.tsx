import { getBackupPermitData } from '@/backups'
import { BackupState } from '@/types'
import styled from '@emotion/styled'
import { constants, Signer } from 'ethers'
import { useState } from 'react'
import { useNetwork, useSigner, useSignTypedData } from 'wagmi'
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
    if (!chain || !signTypedDataAsync) return

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
    } catch (e) {}

    // save signature here
    setSigning(false)
    setStep(3)
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
