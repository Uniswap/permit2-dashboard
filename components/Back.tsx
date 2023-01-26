import { colors } from '@/styles/colors'
import styled from '@emotion/styled'

export function Back({ setStep }: any) {
  return <BackButton onClick={() => setStep((step: number) => step - 1)}>back</BackButton>
}

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${colors.gray300};
  font-size: 18px;
  align-self: flex-start;
`
