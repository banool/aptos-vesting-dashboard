import { useQuery, UseQueryResult } from "react-query";
import { getUpcomingReward } from "..";
import { ResponseError } from "../client";
import { useGlobalState } from "../../GlobalState";

export function useGetUpcomingReward(
  vestingContractAddress: string,
  beneficiaryAddress: string,
  options: { enabled?: boolean } = {},
): UseQueryResult<number> {
  const [state, _setState] = useGlobalState();

  const result = useQuery<number, ResponseError>(
    [
      "upcomingRewardOcta",
      { vestingContractAddress, beneficiaryAddress },
      state.network_value,
    ],
    () =>
      getUpcomingReward(
        vestingContractAddress,
        beneficiaryAddress,
        state.network_value,
      ),
    { refetchOnWindowFocus: false, enabled: options.enabled },
  );

  return result;
}
