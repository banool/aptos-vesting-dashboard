import {
  Box,
  Text,
  Card,
  CardBody,
  Stack,
  StackDivider,
  useDisclosure,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Center,
  Tooltip,
} from "@chakra-ui/react";
import { useGetAccountResource } from "../api/hooks/useGetAccountResource";
import {
  useBuildExplorerUrl,
  getDatetimePretty,
  getShortAddress,
  formatAptAmount,
  octaToApt,
  formatUsdAmount,
  aptToOcta,
} from "../utils";
import { EquationEvaluate, defaultErrorHandler } from "react-equation";
import { useCallback, useState } from "react";
import React from "react";
import { useEffect } from "react";
import "../styles/equation.css";
import { useGetAptToUsd } from "../api/hooks/useGetAptToUsd";
import { useQuery } from "react-query";
import { useGetUpcomingReward } from "../api/hooks/useGetUpcomingReward";

export type RewardsInfoProps = {
  vestingContractAddress: string;
  beneficiaryAddress: string | undefined;
  stakePoolAddress: string;
  vestingContractData: any;
};

export const RewardsInfo = ({
  vestingContractAddress,
  beneficiaryAddress,
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

  const {
    data: upcomingRewards,
    isLoading: upcomingRewardsIsLoading,
    error: upcomingRewardsError,
  } = useGetUpcomingReward(vestingContractAddress, beneficiaryAddress!, {
    enabled: beneficiaryAddress !== undefined,
  });

  const { aptToUsd } = useGetAptToUsd();

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
  if (upcomingRewards !== undefined) {
    console.log(`Value in OCTA: ${upcomingRewards}`);

    const value = Number(octaToApt(BigInt(upcomingRewards)));
    let amountString = formatAptAmount(value);
    if (aptToUsd) {
      amountString += ` (${formatUsdAmount(value * aptToUsd)})`;
    }
    amountComponent = (
      <>
        <Text pt="2" fontSize="sm">
          <strong>Amount:</strong> {amountString}
        </Text>
      </>
    );
  }

  if (upcomingRewardsError) {
    amountComponent = (
      <>
        <Text pt="2" fontSize="sm">
          <strong>Amount:</strong> {`Error: ${upcomingRewardsError}`}
        </Text>
      </>
    );
  }

  // You'll see that when the modal is closed, we render the equation as hidden.
  // This is a gross hack but we need to render the equation in order to calculate
  // the value, which causes the amount to show, which then shows the equation
  // button. Yeah...
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
              <Tooltip
                label="Note: The rewards will not actually be available at this time, but when the next epoch after this time begins (up to 2 hours). See the Transact page for more accurate information if this time has just passed and you're waiting for the next epoch."
                placement="auto"
              >
                <Text pt="2" fontSize="sm">
                  <strong>Next Reward:</strong>{" "}
                  {getDatetimePretty(Number(lockedUntilSecs))} <sup>ⓘ</sup>
                </Text>
              </Tooltip>
              {amountComponent}
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </>
  );
};
