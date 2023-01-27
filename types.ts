export type BackupState = {
  squad: string[] // account addresses
  tokens: string[] // token addresses
  signature: string | null
  identifier: string | null // random 2 word string like "loquacious-fox" that acts as an id for this backup
}

export type RecoveryData = {
  originalAddress: string | null
  recipientAddress: string | null
  status: string
  signatures: { [address: string]: string }
  squad: string[]
  backedUpTokenCount: number
  backedUpTokenValue: number
  permittedTokens: string[]
  identifier: string | null
  tokens: string[]
  backupSignature: string | null
  deadline: number | null
}
