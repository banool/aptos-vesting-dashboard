import { Types } from "aptos";
import { UseQueryResult } from "react-query";
import { useGetAccountResourceResponse } from "../../api/hooks/useGetAccountResource";
import { getDatetimePretty } from "../../utils";

const EPOCH_DURATION_SECS = 2 * 60 * 60;

export type CanCallStatus = "loading" | "canCall" | "cannotCall";

export type CanCallResponse = {
  canCallStatus: CanCallStatus;
  reason: string;
};

const checkResponse = (
  response: UseQueryResult<Types.MoveResource, unknown>,
): CanCallResponse | null => {
  if (response.isLoading) {
    return {
      canCallStatus: "loading",
      reason: `Still loading resource...`,
    };
  }
  if (response.isError) {
    return {
      canCallStatus: "cannotCall",
      reason: `Failed to load resource.`,
    };
  }
  return null;
};

export const canCallVest = (
  vestingContractResponse: UseQueryResult<Types.MoveResource, unknown>,
  configurationResponse: useGetAccountResourceResponse,
): CanCallResponse => {
  return {
    canCallStatus: "cannotCall",
    reason: "Not implemented yet.",
  };
};

// This function takes into account all the necessary information and determines
// whether the button should be pressable. It returns a yes/no and a reason
// explaining why.
//
// Params:
// - vestingContractResponses are the vesting contract resource responses.
// - configurationResponse is the configuration resource response.
export const canCallUnlockRewards = (
  vestingContractResponse: UseQueryResult<Types.MoveResource, unknown>,
  stakePoolResponse: UseQueryResult<Types.MoveResource, unknown>,
  configurationResponse: useGetAccountResourceResponse,
): CanCallResponse => {
  const maybeResponse1 = checkResponse(vestingContractResponse);
  if (maybeResponse1) {
    return maybeResponse1;
  }
  const maybeResponse2 = checkResponse(stakePoolResponse);
  if (maybeResponse2) {
    return maybeResponse2;
  }
  if (configurationResponse.isLoading) {
    return {
      canCallStatus: "loading",
      reason: "Waiting for configuration resource to load...",
    };
  }
  if (configurationResponse.error || !configurationResponse.accountResource) {
    console.log(
      `Failed to load configuration resource: ${configurationResponse.error}`,
    );
    return {
      canCallStatus: "cannotCall",
      reason: "Failed to load configuration resource.",
    };
  }
  const lastEpochConfigurationTimeSecs =
    (configurationResponse.accountResource!.data as any)
      .last_reconfiguration_time / 1e6;
  const lockedUntilSecs = (stakePoolResponse.data!.data as any)
    .locked_until_secs;
  const nowSecs = Math.floor(Date.now() / 1000);
  if (nowSecs > lockedUntilSecs) {
    if (lastEpochConfigurationTimeSecs > lockedUntilSecs) {
      return {
        canCallStatus: "canCall",
        reason: "You can unlock rewards 🤠",
      };
    } else {
      const nextEpochSecs =
        lastEpochConfigurationTimeSecs + EPOCH_DURATION_SECS;
      return {
        canCallStatus: "cannotCall",
        reason: `The next round of rewards are still locked for this contract. We have passed the unlock time but we're still waiting for this epoch to end, which will happen at ${getDatetimePretty(
          nextEpochSecs,
        )}.`,
      };
    }
  } else {
    return {
      canCallStatus: "cannotCall",
      reason: `The next round of rewards are still locked for this contract, they will unlock at the start of the next epoch after ${getDatetimePretty(
        lockedUntilSecs,
      )}.`,
    };
  }
};

export const canCallDistribute = (
  vestingContractResponse: UseQueryResult<Types.MoveResource, unknown>,
  configurationResponse: useGetAccountResourceResponse,
): CanCallResponse => {
  return {
    canCallStatus: "cannotCall",
    reason: "Not implemented yet.",
  };
};
