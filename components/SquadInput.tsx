import { BackupState } from '@/types'
import styled from '@emotion/styled'
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
  const onChangeSquadMember = (index: number) => (newSquadMember: string) => {
    const newSquad = [...backup.squad]
    newSquad[index] = newSquadMember
    setBackup((prev: BackupState) => ({
      ...prev,
      squad: newSquad,
    }))
  }

  const onContinue = () => {
    // sign typed data message here
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
        onChange={onChangeSquadMember(3)}
        value={backup.squad[3] ?? ''}
        placeholder="0x123.."
      />
      <button onClick={onContinue}>Continue</button>
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
