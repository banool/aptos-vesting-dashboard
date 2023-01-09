import {
  Box,
  Text,
  Card,
  CardBody,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { useGetAccountResource } from "../api/hooks/useGetAccountResource";
import { getDatetimePretty, getShortAddress } from "../utils";

export type RewardsInfoProps = {
  stakingPoolAddress: string;
};

export const RewardsInfo = ({ stakingPoolAddress }: RewardsInfoProps) => {
  // TODO: This hook can only run based on the output of the previous hook
  // in the parent that fetches the vesting pool info (see that first).
  // However, this does not handle the case where there is some error in the
  // first hook. But I can't put the hook deeper because I want access to this
  // value here. I wish you could call hooks conditionally. I wonder what the
  // correct pattern is. Perhaps I need to make the hook be able to accept
  // an address or undefined, and handle the undefined case. Update, that doesn't
  // work, because then the useQuery hook is used conditionally...
  // Update: You can do this: https://tanstack.com/query/v4/docs/react/guides/dependent-queries.
  const { isLoading, accountResource, error } = useGetAccountResource(
    stakingPoolAddress,
    "0x1::stake::StakePool",
  );

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
        Resource unexpectedly undefined
      </Text>
    );
  }

  const lockedUntilSecs = BigInt(
    (accountResource.data as any).locked_until_secs,
  );

  // TODO: Add a helper function to build links to the explorer that use the
  // correct network query param.
  return (
    <Card margin={3}>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Text fontSize="sm">
              <strong>Staking Pool Address: </strong>
              <a
                href={`https://explorer.aptoslabs.com/account/${stakingPoolAddress}`}
              >
                {getShortAddress(stakingPoolAddress)}
              </a>
            </Text>
            <Text pt="2" fontSize="sm">
              <strong>Next Reward:</strong>{" "}
              {getDatetimePretty(Number(lockedUntilSecs))}
            </Text>
            <Text pt="2" fontSize="sm">
              <strong>Amount:</strong> {"Coming soon!"}
            </Text>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
};
