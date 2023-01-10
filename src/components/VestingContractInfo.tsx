import {
  Box,
  Text,
  Card,
  CardBody,
  Stack,
  StackDivider,
  Center,
} from "@chakra-ui/react";
import { getShortAddress, useBuildExplorerUrl } from "../utils";

export type RewardsInfoProps = {
  vestingContractAddress: string;
  resourceData: any;
};

export const VestingContractInfo = ({
  vestingContractAddress,
  resourceData,
}: RewardsInfoProps) => {
  return (
    <Card margin={3}>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Text fontSize="sm">
              <strong>Vesting Contract Address: </strong>
              <a href={useBuildExplorerUrl(vestingContractAddress)}>
                {getShortAddress(vestingContractAddress)}
              </a>
            </Text>
            <Text pt="2" fontSize="sm">
              <strong>Operator Address: </strong>
              <a href={useBuildExplorerUrl(resourceData.staking.operator)}>
                {getShortAddress(resourceData.staking.operator)}
              </a>
            </Text>
            <Text pt="2" fontSize="sm">
              <strong>Pool Address: </strong>
              <a href={useBuildExplorerUrl(resourceData.staking.pool_address)}>
                {getShortAddress(resourceData.staking.pool_address)}
              </a>
            </Text>
            <Text pt="2" fontSize="sm">
              <strong>Voter Address: </strong>
              <a href={useBuildExplorerUrl(resourceData.staking.voter)}>
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
