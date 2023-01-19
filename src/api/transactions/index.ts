import { AptosClient } from "aptos";

async function submitTransaction(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  fullnodeUrl: string,
  transaction: any,
) {
  const pendingTransaction = await signAndSubmitTransaction(transaction);
  const client = new AptosClient(fullnodeUrl);
  await client.waitForTransactionWithResult(pendingTransaction.hash, {
    checkSuccess: true,
  });
}

export async function vest(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  fullnodeUrl: string,
  vestingContractAddresses: string[],
) {
  const transaction = {
    type: "entry_function_payload",
    function: `0x1::vesting::vest_many`,
    type_arguments: [],
    arguments: [vestingContractAddresses],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function unlockRewards(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  fullnodeUrl: string,
  vestingContractAddresses: string[],
) {
  const transaction = {
    type: "entry_function_payload",
    function: `0x1::vesting::unlock_rewards_many`,
    type_arguments: [],
    arguments: [vestingContractAddresses],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function distribute(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  fullnodeUrl: string,
  vestingContractAddresses: string[],
) {
  const transaction = {
    type: "entry_function_payload",
    function: `0x1::vesting::distribute_many`,
    type_arguments: [],
    arguments: [vestingContractAddresses],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}
