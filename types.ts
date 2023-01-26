export type BackupState = {
  squad: string[] // account addresses
  tokens: string[] // token addresses
  signature: string | null
  identifier: string | null // random 2 word string like "loquacious-fox" that acts as an id for this backup
}
