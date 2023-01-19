import { Td, Tooltip } from "@chakra-ui/react";
import { Types } from "aptos";
import { UseQueryResult } from "react-query";
import { useGetAccountResourceResponse } from "../../api/hooks/useGetAccountResource";
import {
  canCallDistribute,
  CanCallResponse,
  canCallUnlockRewards,
  canCallVest,
} from "./validation";

type RowInfoProps = {
  vestingContractResponse: UseQueryResult<Types.MoveResource> | undefined;
  configurationResponse: useGetAccountResourceResponse | undefined;
  stakePoolResponse: UseQueryResult<Types.MoveResource> | undefined;
};

export const RowInfo = ({
  vestingContractResponse,
  configurationResponse,
  stakePoolResponse,
}: RowInfoProps) => {
  // Returns null if there is no early return to use.
  const getEarlyReturn = (response: any | undefined) => {
    if (response === undefined) {
      return (
        <>
          <Td></Td>
          <Td></Td>
          <Td></Td>
        </>
      );
    }
    return null;
  };

  // Handle if either of the resources aren't loaded yet.
  const earlyReturn1 = getEarlyReturn(vestingContractResponse);
  if (earlyReturn1 !== null) {
    return earlyReturn1;
  }
  const earlyReturn2 = getEarlyReturn(stakePoolResponse);
  if (earlyReturn2 !== null) {
    return earlyReturn2;
  }
  const earlyReturn3 = getEarlyReturn(configurationResponse);
  if (earlyReturn3 !== null) {
    return earlyReturn3;
  }

  const canVest = canCallVest(vestingContractResponse!, configurationResponse!);
  const canUnlockRewards = canCallUnlockRewards(
    vestingContractResponse!,
    stakePoolResponse!,
    configurationResponse!,
  );
  const canDistribute = canCallDistribute(
    vestingContractResponse!,
    configurationResponse!,
  );

  const getTd = (canCallResponse: CanCallResponse) => {
    let str;
    switch (canCallResponse.canCallStatus) {
      case "canCall":
        str = "✅";
        break;
      case "cannotCall":
        str = "❌";
        break;
      case "loading":
        str = "⏳";
        break;
    }
    return (
      <Td>
        <Tooltip label={canCallResponse.reason}>{str}</Tooltip>
      </Td>
    );
  };

  return (
    <>
      {getTd(canVest)}
      {getTd(canUnlockRewards)}
      {getTd(canDistribute)}
    </>
  );
};
