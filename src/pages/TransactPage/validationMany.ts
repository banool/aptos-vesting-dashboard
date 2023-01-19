import { Types } from "aptos";
import { UseQueryResult } from "react-query";
import { useGetAccountResourceResponse } from "../../api/hooks/useGetAccountResource";
import { CanCallResponse, canCallUnlockRewards } from "./validation";

const checkBypass = (bypassValidation: boolean): CanCallResponse | null => {
  if (bypassValidation) {
    return {
      canCallStatus: "canCall",
      reason:
        "Validation bypassed. Be careful, you're entering 🤡 territory, this function might not do anything.",
    };
  }
  return null;
};

const checkResponsesEmpty = (
  responses: UseQueryResult<Types.MoveResource, unknown>[],
): CanCallResponse | null => {
  if (responses.length === 0) {
    return {
      canCallStatus: "loading",
      reason: "Waiting for input.",
    };
  }
  return null;
};

export const canCallVestMany = (
  vestingContractResponses: UseQueryResult<Types.MoveResource, unknown>[],
  configurationResponse: useGetAccountResourceResponse,
  bypassValidation: boolean,
): CanCallResponse => {
  const maybeResponse1 = checkResponsesEmpty(vestingContractResponses);
  if (maybeResponse1) {
    return maybeResponse1;
  }
  const maybeResponse2 = checkBypass(bypassValidation);
  if (maybeResponse2) {
    return maybeResponse2;
  }
  return {
    canCallStatus: "loading",
    reason: "Validation not implemented yet.",
  };
};

// This function takes into account all the necessary information and determines
// whether the button should be pressable. It returns a yes/no and a reason
// explaining why.
//
// Params:
// - vestingContractResponses are the vesting contract resource responses.
// - configurationResponse is the configuration resource response.
export const canCallUnlockRewardsMany = (
  vestingContractResponses: UseQueryResult<Types.MoveResource, unknown>[],
  stakePoolResponses: UseQueryResult<Types.MoveResource, unknown>[],
  configurationResponse: useGetAccountResourceResponse,
  bypassValidation: boolean,
): CanCallResponse => {
  const maybeResponse1 = checkResponsesEmpty(vestingContractResponses);
  if (maybeResponse1) {
    return maybeResponse1;
  }
  const maybeResponse2 = checkBypass(bypassValidation);
  if (maybeResponse2) {
    return maybeResponse2;
  }

  let canCallCount = 0;
  let cannotCallCount = 0;
  let loadingCount = 0;

  for (var i = 0; i < vestingContractResponses.length; i++) {
    const canCallResponse = canCallUnlockRewards(
      vestingContractResponses[i],
      stakePoolResponses[i],
      configurationResponse,
    );
    if (canCallResponse.canCallStatus === "canCall") {
      canCallCount += 1;
    }
    if (canCallResponse.canCallStatus === "cannotCall") {
      cannotCallCount += 1;
    }
    if (canCallResponse.canCallStatus === "loading") {
      loadingCount += 1;
    }
  }
  if (loadingCount > 0) {
    return {
      canCallStatus: "loading",
      reason: `Still loading ${loadingCount}/${vestingContractResponses.length} resources from the API...`,
    };
  }

  if (cannotCallCount > 0) {
    return {
      canCallStatus: "cannotCall",
      reason: "Rewards are still locked for at least one vesting contract.",
    };
  }

  return {
    canCallStatus: "canCall",
    reason: "You can unlock rewards for all vesting contracts 🤠",
  };
};

export const canCallDistributeMany = (
  vestingContractResponses: UseQueryResult<Types.MoveResource, unknown>[],
  bypassValidation: boolean,
): CanCallResponse => {
  const maybeResponse1 = checkResponsesEmpty(vestingContractResponses);
  if (maybeResponse1) {
    return maybeResponse1;
  }
  const maybeResponse2 = checkBypass(bypassValidation);
  if (maybeResponse2) {
    return maybeResponse2;
  }
  return {
    canCallStatus: "loading",
    reason: "Validation not implemented yet.",
  };
};
