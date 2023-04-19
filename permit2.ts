import { BigNumber, ethers } from 'ethers';
import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethers-multicall';
import Permit2Abi from '@/abis/Permit2.json'
import { Permit2__factory } from '@/types/ethers-contracts';
import {
  PermitBatch,
  PermitBatchData,
  AllowanceTransfer,
  MaxSigDeadline
} from '@uniswap/permit2-sdk'

const PERMIT2="0x000000000022d473030f116ddee9f6b43ac78ba3"

export type TokenSpender = {
  token: string;
  spender: string;
}

export type Allowances = {
  [token: string]: {
    [spender: string]: {
      amount: BigNumber;
      expiration: number;
    }
  }
}

export async function useAllowances(provider: ethers.providers.Provider, owner: string, tokenSpenders: TokenSpender[]): Promise<Allowances> {
  const multicallProvider = new MulticallProvider(provider);
  await multicallProvider.init();
  const permit2Contract = new MulticallContract(PERMIT2, Permit2Abi);

  const calls = tokenSpenders.map(({ token, spender }) =>
    permit2Contract.allowance(owner, token, spender)
  );

  const results = await multicallProvider.all(calls);

  return results.reduce((allowances, [amount, expiration], i) => {
    const { token, spender } = tokenSpenders[i];
    if (!allowances[token]) {
      allowances[token] = {};
    }
    allowances[token][spender] = { amount, expiration };
    return allowances;
  });
}

export async function useAllowances(provider: ethers.providers.Provider, owner: string, tokenSpenders: TokenSpender[]): Promise<Allowances> {
  const multicallProvider = new MulticallProvider(provider);
  await multicallProvider.init();
  const permit2Contract = new MulticallContract(PERMIT2, Permit2Abi);

  const calls = tokenSpenders.map(({ token, spender }) =>
    permit2Contract.allowance(owner, token, spender)
  );

  const results = await multicallProvider.all(calls);

  return results.reduce((allowances, [amount, expiration], i) => {
    const { token, spender } = tokenSpenders[i];
    if (!allowances[token]) {
      allowances[token] = {};
    }
    allowances[token][spender] = { amount, expiration };
    return allowances;
  });
}

export function buildRevokePermit(chainId: number, nonce: BigNumber, spender: string, tokens: string[]): PermitBatchData {
  const permitBatch: PermitBatch = {
    details: tokens.map((token) => ({
      token,
      // no more allowance anymore
      amount: 0,
      // also it instantly expires
      expiration: 0,
      nonce,
    })),
    spender,
    sigDeadline: MaxSigDeadline,
  };

  // dump this response into wallet.signTypedData
  return AllowanceTransfer.getPermitData(permitBatch, PERMIT2, chainId) as PermitBatchData;
}
