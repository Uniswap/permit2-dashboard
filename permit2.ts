import { BigNumber, ethers } from 'ethers';
import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethers-multicall';
import Permit2Abi from '@/abis/Permit2.json'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import {
  PermitBatch,
  AllowanceTransfer,
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
