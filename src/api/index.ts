import { AptosClient, Types } from "aptos";
import { withResponseError } from "./client";

export function getLedgerInfoWithoutResponseError(
  nodeUrl: string,
): Promise<Types.IndexResponse> {
  const client = new AptosClient(nodeUrl);
  return client.getLedgerInfo();
}

export function getAccountResources(
  requestParameters: { address: string; ledgerVersion?: number },
  nodeUrl: string,
): Promise<Types.MoveResource[]> {
  const client = new AptosClient(nodeUrl);
  const { address, ledgerVersion } = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResources(address, { ledgerVersion: ledgerVersionBig }),
  );
}

export function getAccountResource(
  requestParameters: {
    address: string;
    resourceType: string;
    ledgerVersion?: number;
  },
  nodeUrl: string,
): Promise<Types.MoveResource> {
  const client = new AptosClient(nodeUrl);
  const { address, resourceType, ledgerVersion } = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResource(address, resourceType, {
      ledgerVersion: ledgerVersionBig,
    }),
  );
}

export async function getUpcomingReward(
  vestingContractAddress: string,
  beneficiaryAddress: string,
  nodeUrl: string,
): Promise<number> {
  const client = new AptosClient(nodeUrl);
  const payload: Types.ViewRequest = {
    function: "0x1::vesting::accumulated_rewards",
    type_arguments: [],
    arguments: [vestingContractAddress, beneficiaryAddress],
  };
  const response = await client.view(payload);
  return parseInt(response[0] as any);
}
