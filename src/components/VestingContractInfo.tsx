import {
  Box,
  Text,
  Card,
  CardBody,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { getShortAddress } from "../utils";

export type RewardsInfoProps = {
  vestingContractAddress: string;
  resourceData: any;
};

export const VestingContractInfo = ({
  vestingContractAddress,
  resourceData,
}: RewardsInfoProps) => {
  // TODO: Add a helper function to build links to the explorer that use the
  // correct network query param.
  return (
    <Card margin={3}>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Text fontSize="sm">
              <strong>Vesting Contract Address: </strong>
              <a
                href={`https://explorer.aptoslabs.com/account/${vestingContractAddress}`}
              >
                {getShortAddress(vestingContractAddress)}
              </a>
            </Text>
            <Text pt="2" fontSize="sm">
              <strong>Operator Address: </strong>
              <a
                href={`https://explorer.aptoslabs.com/account/${resourceData.staking.operator}`}
              >
                {getShortAddress(resourceData.staking.operator)}
              </a>
            </Text>
            <Text pt="2" fontSize="sm">
              <strong>Pool Address: </strong>
              <a
                href={`https://explorer.aptoslabs.com/account/${resourceData.staking.pool_address}`}
              >
                {getShortAddress(resourceData.staking.pool_address)}
              </a>
            </Text>
            <Text pt="2" fontSize="sm">
              <strong>Voter Address: </strong>
              <a
                href={`https://explorer.aptoslabs.com/account/${resourceData.staking.voter}`}
              >
                {getShortAddress(resourceData.staking.voter)}
              </a>
            </Text>
            <Text pt="2" fontSize="sm">
              <strong>Operator Commission: </strong>
              {resourceData.staking.commission_percentage}
              {"%"}
            </Text>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
};
