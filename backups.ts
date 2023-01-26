import { BigNumber } from 'ethers';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import {
  PermitBatchTransferFrom,
  PermitBatchTransferFromData,
  SignatureTransfer,
  MaxSignatureTransferAmount,
  MaxSigDeadline,
} from "@uniswap/permit2-sdk";
import { useNetwork } from 'wagmi'

const WITNESS_TYPES = {
  TokenBackups: [
    { name: "signers", type: "address[]" },
    { name: "threshold", type: "uint256" },
  ],
};

const PAL_SIGNATURE_TYPES = {
  PalSignature: [
    { name: "newAddress", type: "address" },
    { name: "details", type: "SignatureTransferDetails[]" },
  ],
  SignatureTransferDetails: [
    { name: "to", type: "address" },
    { name: "requestedAmount", type: "uint256" },
  ],
};

const PERMIT2_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3';
const TOKEN_BACKUPS_ADDRESS = 'fill_in_later';
// nonce doesnt really matter, just has to be unique 256 bits
const BACKUP_NONCE = BigNumber.from('6969696969696969696969696969696969696969420');

type PalSignatureValues = {
  newAddress: string;
  details: {
    to: string;
    requestedAmount: BigNumber;
  }[],
}

type PalSignatureData = {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    values: PalSignatureValues;
};

export interface RecoveryInfo {
  backup: BackupInfo,
  backupSignature: string,
  owner: string,
  recipient: string,
  balances: {
    [address: string]: BigNumber,
  };
}

export interface BackupInfo {
  pals: string[]
  tokens: string[]
  threshold: BigNumber,
}

export function getBackupPermitData(info: BackupInfo): PermitBatchTransferFromData | null {
  const { chain } = useNetwork()

  if (!chain) {
    return null;
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

  return SignatureTransfer.getPermitData(
    permit,
    PERMIT2_ADDRESS,
    chain.id,
    {
      witness: {
        signers: info.pals,
        threshold: info.threshold,
      },
      witnessTypeName: 'TokenBackups',
      witnessType: WITNESS_TYPES,
    }
  ) as PermitBatchTransferFromData;
}

export function getPalRecoverySignatureData(info: RecoveryInfo): PalSignatureData | null {
  const { chain } = useNetwork()

  if (!chain) {
    return null;
  }

  const details = info.backup.tokens.filter((token) => {
    info.balances[token] && info.balances[token].gt(0);
  }).map((token) => ({
    to: info.recipient,
    requestedAmount: info.balances[token],
  }));

  return {
    domain: tokenBackupsDomain(TOKEN_BACKUPS_ADDRESS, chain.id),
    types: PAL_SIGNATURE_TYPES,
    values: {
      newAddress: info.recipient,
      details,
    },
  };
}

function tokenBackupsDomain(tokenBackupsAddress: string, chainId: number): TypedDataDomain {
  return {
    name: 'TokenBackups',
    chainId,
    verifyingContract: tokenBackupsAddress,
    version: '1',
  }
}
