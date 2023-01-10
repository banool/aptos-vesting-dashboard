import {
  Box,
  Text,
  Card,
  CardBody,
  Stack,
  StackDivider,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Center,
  Flex,
} from "@chakra-ui/react";
import { useGetAccountResource } from "../api/hooks/useGetAccountResource";
import {
  useBuildExplorerUrl,
  getDatetimePretty,
  getShortAddress,
  formatAptAmount,
  octaToApt,
} from "../utils";
import { EquationEvaluate, defaultErrorHandler } from "react-equation";
import { useCallback, useState } from "react";
import React from "react";
import { useEffect } from "react";

export type RewardsInfoProps = {
  // This is not the beneficiary address, but the staker address resolved from it.
  stakerAddress: string | null;
  stakePoolAddress: string;
  vestingContractData: any;
};

export const RewardsInfo = ({
  stakerAddress,
  stakePoolAddress,
  vestingContractData,
}: RewardsInfoProps) => {
  // TODO: This hook can only run based on the output of the previous hook
  // in the parent that fetches the vesting pool info (see that first).
  // However, this does not handle the case where there is some error in the
  // first hook. But I can't put the hook deeper because I want access to this
  // value here. I wish you could call hooks conditionally. I wonder what the
  // correct pattern is. Perhaps I need to make the hook be able to accept
  // an address or undefined, and handle the undefined case. Update, that doesn't
  // work, because then the useQuery hook is used conditionally...
  // Update: You can do this: https://tanstack.com/query/v4/docs/react/guides/dependent-queries.
  // Update: Also see this: https://stackoverflow.com/q/75067556/3846032.
  const { isLoading, accountResource, error } = useGetAccountResource(
    stakePoolAddress,
    "0x1::stake::StakePool",
  );

  // const equationRef = useRef<any>();
  const [equationState, setEquationState] = useState<any>(null);

  const equationRef = useCallback(
    (newState: any) => {
      if (newState !== null) {
        // Don't set the equation state again if there is already a matching one.
        if (equationState !== null && equationState.value === newState.value) {
          return;
        }
        setEquationState(newState);
      }
    },
    [equationState],
  );

  // If the stakerAddress changes, clear the equation state.
  useEffect(() => {
    setEquationState(null);
  }, [stakerAddress]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const explorerUrl = useBuildExplorerUrl(stakePoolAddress);

  if (error) {
    return (
      <Text
        p={6}
        textAlign={"center"}
      >{`Error fetching vesting contract: ${JSON.stringify(error)}`}</Text>
    );
  }

  if (isLoading) {
    return (
      <Text p={6} textAlign={"center"}>
        Loading staking pool info...
      </Text>
    );
  }

  if (accountResource === undefined) {
    return (
      <Text p={6} textAlign={"center"}>
        Staking pool resource unexpectedly undefined
      </Text>
    );
  }

  const data = accountResource.data as any;

  const lockedUntilSecs = BigInt(data.locked_until_secs);

  let amountComponent = null;
  let equationComponent = null;
  if (stakerAddress !== null) {
    equationComponent = (
      <RewardsEquation
        ref={equationRef}
        vestingContractData={vestingContractData}
        stakePoolData={data}
        stakerAddress={stakerAddress}
      />
    );
  }

  if (equationState !== null) {
    amountComponent = (
      <>
        <Text pt="2" fontSize="sm">
          <strong>Amount:</strong> {formatAptAmount(equationState.result.value)}
        </Text>
      </>
    );
  }

  return (
    <>
      <Card margin={3}>
        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Text fontSize="sm">
                <strong>Staking Pool Address: </strong>
                <a href={explorerUrl}>{getShortAddress(stakePoolAddress)}</a>
              </Text>
              <Text pt="2" fontSize="sm">
                <strong>Next Reward:</strong>{" "}
                {getDatetimePretty(Number(lockedUntilSecs))}
              </Text>
              {amountComponent}
            </Box>
          </Stack>
        </CardBody>
      </Card>
      {equationComponent}
    </>
  );
};

// Builds the params with everything converted from OCTA to APT.

export type RewardsEquationProps = {
  vestingContractData: any;
  stakePoolData: any;
  stakerAddress: string;
};

export const RewardsEquation = React.forwardRef<any, RewardsEquationProps>(
  ({ vestingContractData, stakePoolData, stakerAddress }, ref) => {
    function buildEquationParams(
      vestingContractData: any,
      stakePoolData: any,
      stakerAddress: string,
    ): any | undefined {
      // First, make sure the staker address can actually be found.
      const shareholderShareAmountRaw =
        vestingContractData.grant_pool.shares.data.find(
          (item: any) => item.key === stakerAddress,
        );
      if (shareholderShareAmountRaw === undefined) {
        return undefined;
      }
      // Build the params.
      const params = {
        remainingGrant: {
          type: "number",
          value: Number(octaToApt(BigInt(vestingContractData.remaining_grant))),
        },
        active: {
          type: "number",
          value: Number(octaToApt(BigInt(stakePoolData.active.value))),
        },
        commissionRate: {
          type: "number",
          value: Number(vestingContractData.staking.commission_percentage),
        },
        shareholderShareAmount: {
          type: "number",
          value: Number(
            octaToApt(
              BigInt(
                vestingContractData.grant_pool.shares.data.find(
                  (item: any) => item.key === stakerAddress,
                )?.value,
              ),
            ),
          ),
        },
        originalGrantAmount: {
          type: "number",
          value: Number(
            octaToApt(BigInt(vestingContractData.grant_pool.total_coins)),
          ),
        },
      };
      return params;
    }

    const params = buildEquationParams(
      vestingContractData,
      stakePoolData,
      stakerAddress,
    );

    if (params === undefined) {
      return null;
    }

    // TODO: Factor in what's in flight, step 5 here:
    // https://github.com/banool/aptos-vesting-dashboard/issues/10.
    const equation =
      "\
    (active - remainingGrant) * ((100 - commissionRate) / 100) * \
    shareholderShareAmount / originalGrantAmount\
  ";

    return (
      <EquationEvaluate
        ref={ref}
        decimals={{ type: "fixed", digits: 2 }}
        value={equation}
        variables={params}
        errorHandler={defaultErrorHandler}
      />
    );
  },
);
