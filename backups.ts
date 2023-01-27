import { BigNumber } from 'ethers';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import {
  PermitBatchTransferFrom,
  PermitBatchTransferFromData,
  SignatureTransfer,
  MaxSignatureTransferAmount,
  MaxSigDeadline,
} from '@uniswap/permit2-sdk'

const WITNESS_TYPES = {
  TokenBackups: [
    { name: 'signers', type: 'address[]' },
    { name: 'threshold', type: 'uint256' },
  ],
}

const PAL_SIGNATURE_TYPES = {
  RecoveryInfo: [
    { name: 'oldAddress', type: 'address' },
    { name: 'sigDeadline', type: 'uint256' },
    { name: 'details', type: 'SignatureTransferDetails[]' },
  ],
  SignatureTransferDetails: [
    { name: 'to', type: 'address' },
    { name: 'requestedAmount', type: 'uint256' },
  ],
}

const PERMIT2_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3'

// TODO: this is a placeholder address
export const TOKEN_BACKUPS_ADDRESS = '0xcDaf90435fa7d7aFf42Dc29B25F080F0C8De7C69'
// nonce doesnt really matter, just has to be unique 256 bits
export const BACKUP_NONCE = BigNumber.from('6969696969696969696969696969696969696969420')

type PalSignatureValues = {
  oldAddress: string
  sigDeadline: number
  details: {
    to: string
    requestedAmount: BigNumber
  }[]
}

type PalSignatureData = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  values: PalSignatureValues
}

export interface RecoveryInfo {
  tokens: string[]
  backupSignature: string
  owner: string
  recipient: string
  deadline: number
  balances: {
    [address: string]: BigNumber
  }
}

export interface BackupInfo {
  pals: string[]
  tokens: string[]
  threshold: BigNumber
}

export function getBackupPermitData(chain: number, info: BackupInfo): PermitBatchTransferFromData | null {
  if (!chain) {
    return null
  }

  const permit: PermitBatchTransferFrom = {
    permitted: info.tokens.map((token) => ({
      token,
      amount: MaxSignatureTransferAmount,
    })),
    spender: TOKEN_BACKUPS_ADDRESS,
    nonce: BACKUP_NONCE,
    deadline: MaxSigDeadline,
  }

  return SignatureTransfer.getPermitData(permit, PERMIT2_ADDRESS, chain, {
    witness: {
      signers: info.pals,
      threshold: info.threshold,
    },
    witnessTypeName: 'TokenBackups',
    witnessType: WITNESS_TYPES,
  }) as PermitBatchTransferFromData
}

export function getPalRecoverySignatureData(chain: number, info: RecoveryInfo): PalSignatureData | null {
  if (!chain) {
    return null
  }

  console.log(info.tokens)
  const details = info.tokens.map((token) => ({
    to: info.recipient,
    requestedAmount: info.balances[token],
  }))
  console.log(details)
  console.log('domain', tokenBackupsDomain(TOKEN_BACKUPS_ADDRESS, chain))

  return {
    domain: tokenBackupsDomain(TOKEN_BACKUPS_ADDRESS, chain),
    types: PAL_SIGNATURE_TYPES,
    values: {
      oldAddress: info.owner,
      sigDeadline: info.deadline,
      details,
    },
  }
}

function tokenBackupsDomain(tokenBackupsAddress: string, chainId: number): TypedDataDomain {
  return {
    name: 'TokenBackups',
    chainId,
    verifyingContract: tokenBackupsAddress,
    version: '1',
  }
}
