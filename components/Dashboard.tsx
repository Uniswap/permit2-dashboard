import { useMemo } from 'react'
import { useProvider } from 'wagmi'

type TokenAndSpender = {
  token: string
  spender: string
}
export default function Dashboard() {
  const provider = useProvider()
  const tokenAndSpenders: TokenAndSpender[] = useMemo(() => {
    // get permit2 contract
    // build .filters using permit2Contract object
    // run the query using .queryFilter on the contract
    // filter through stuff
    return []
  }, [])

  console.log('tokenAndSpenders', tokenAndSpenders)
  return <div>hi</div>
}
