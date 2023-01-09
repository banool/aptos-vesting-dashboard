import { useEffect } from "react";
import { FormControl, Select, Box } from "@chakra-ui/react";
import { defaultFeatureName, NetworkName, networks } from "../constants";
import { useGlobalState } from "../GlobalState";
import { useTheme } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import {
  useGetChainIdCached,
  useGetChainIdAndCache,
} from "../api/hooks/useGetNetworkChainIds";
import { toTitleCase } from "../utils";

function NetworkAndChainIdCached({
  networkName,
  chainId,
}: {
  networkName: string;
  chainId: string | null;
}) {
  return <>{chainId ? `${chainId}: ${toTitleCase(networkName)}` : "---"}</>;
}

function NetworkAndChainId({ networkName }: { networkName: string }) {
  const chainId = useGetChainIdAndCache(networkName as NetworkName);

  const out = chainId ? (
    <NetworkAndChainIdCached networkName={networkName} chainId={chainId} />
  ) : null;
  return out;
}

function NetworkMenuItem({ networkName }: { networkName: string }) {
  const chainIdCached = useGetChainIdCached(networkName as NetworkName);

  return chainIdCached ? (
    <NetworkAndChainIdCached
      networkName={networkName}
      chainId={chainIdCached}
    />
  ) : (
    // This return style is necessary so we can catch the null return from
    // NetworkAndChainId later (if it returns null).
    // https://stackoverflow.com/a/59566588/3846032
    NetworkAndChainId({ networkName: networkName })
  );
}

export default function NetworkSelect() {
  const [state, dispatch] = useGlobalState();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();

  function maybeSetNetwork(networkNameString: string | null) {
    if (!networkNameString || state.network_name === networkNameString) return;
    if (!(networkNameString in networks)) return;
    const feature_name = state.feature_name;
    const network_name = networkNameString as NetworkName;
    const network_value = networks[network_name];
    if (network_value) {
      // Only show the "feature" param in the url when it's not "prod",
      // we don't want the users to know the existence of the "feature" param
      if (feature_name !== defaultFeatureName) {
        setSearchParams({ network: network_name, feature: feature_name });
      } else {
        setSearchParams({ network: network_name });
      }
      dispatch({ network_name, network_value, feature_name });
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const network_name = event.target.value;
    maybeSetNetwork(network_name);
  };

  useEffect(() => {
    const network_name = searchParams.get("network");
    maybeSetNetwork(network_name);
  });

  let options = [];
  for (const networkName in networks) {
    const item = NetworkMenuItem({ networkName: networkName });
    if (item === null) {
      continue;
    }
    options.push(
      <option key={networkName} value={networkName}>
        {item}
      </option>
    );
  }

  return (
    <Box>
      <Select
        id="network-select"
        value={state.network_name}
        onChange={handleChange}
        variant="outlined"
      >
        <option disabled value="">
          Chain ID: Network
        </option>
        {options}
      </Select>
    </Box>
  );
}
