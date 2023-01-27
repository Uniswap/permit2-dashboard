import { colors } from '@/styles/colors'
import styled from '@emotion/styled'
import { useRef } from 'react'

export function RescueInput({
  value,
  onChange,
  title,
  placeholder,
}: {
  value: string
  onChange: (newValue: string) => void
  title: string
  placeholder?: string
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  return (
    <InputContainer onClick={() => inputRef.current?.focus()}>
      <Title>{title}</Title>
      <input ref={inputRef} onChange={(e) => onChange(e.target.value)} value={value} placeholder={placeholder} />
    </InputContainer>
  )
}

const Title = styled.div`
  font-size: 18px;
  line-height: 20px;
`

const InputContainer = styled.div`
  cursor: text;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid #e8eaf1;

  display: flex;
  flex-flow: column;
  gap: 5px;

  > input {
    font-size: 30px;
    border: none;

    &:focus {
      outline: none;
    }

    ::placeholder {
      color: ${colors.gray100};
    }
  }
`
