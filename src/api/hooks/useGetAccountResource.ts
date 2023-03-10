import { Types } from "aptos";
import { useQuery } from "react-query";
import { getAccountResource } from "..";
import { ResponseError } from "../client";
import { useGlobalState } from "../../GlobalState";

export type useGetAccountResourceResponse = {
  accountResource: Types.MoveResource | undefined;
  isLoading: boolean;
  error: ResponseError | null;
};

export function useGetAccountResource(
  address: string,
  resource: string,
  options: { enabled?: boolean } = {},
): useGetAccountResourceResponse {
  const [state, _setState] = useGlobalState();

  const accountResourcesResult = useQuery<Types.MoveResource, ResponseError>(
    ["accountResource", { address }, state.network_value],
    () =>
      getAccountResource(
        { address, resourceType: resource },
        state.network_value,
      ),
    { refetchOnWindowFocus: false, enabled: options.enabled },
  );

  const { isLoading, error } = accountResourcesResult;

  const accountResource = accountResourcesResult.data;

  return { accountResource, isLoading, error };
}
