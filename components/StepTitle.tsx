import styled from '@emotion/styled'

export function StepTitle({ index, title }: { index: number; title: string }) {
  return (
    <Title>
      <div>{index}.</div>
      <div>{title}</div>
    </Title>
  )
}

const Title = styled.div`
  display: flex;
  gap: 8px;
  font-size: 24px;
  align-items: flex-start;
`
