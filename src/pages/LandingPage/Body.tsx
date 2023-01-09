import { Box, Center, Flex, Heading, Text } from "@chakra-ui/react";
import { useGetAccountResource } from "../../api/hooks/useGetAccountResource";
import { RewardsInfo } from "../../components/RewardsInfo";
import { VestingTimeline } from "../../components/VestingTimeline";
import { octaToApt } from "../../utils";

type BodyProps = {
  vestingContractAddress: string;
  beneficiaryAddress: string;
};

export const Body = ({
  vestingContractAddress,
  beneficiaryAddress,
}: BodyProps) => {
  const { isLoading, accountResource, error } = useGetAccountResource(
    vestingContractAddress,
    "0x1::vesting::VestingContract",
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
        Loading...
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

  // Pull out relevant info from the resource from the account with the vesting
  // contract.
  const data = accountResource.data as any;

  // Determine additional information if a beneficiary address was given.
  const stakerAccountAddress = beneficiaryAddress
    ? getStakerAccountAddress(data, beneficiaryAddress)
    : null;
  const stakerGrantAmount = getStakerGrantAmount(data, stakerAccountAddress);
  const stakerGrantAmountApt = stakerGrantAmount
    ? octaToApt(stakerGrantAmount)
    : null;

  let additionalInfoMessage = null;
  if (beneficiaryAddress === "") {
    additionalInfoMessage =
      "\
        Enter a beneficiary address to see information about how much will vest \
        each cycle. This address can either be the original address you received \
        via email or the new address you provided for your rewards to get paid \
        out to.\
    ";
  }
  if (beneficiaryAddress.length > 0 && stakerGrantAmount === null) {
    additionalInfoMessage =
      "\
        The given beneficiary address could not be found!\
    ";
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const stakingPoolAddress: string | undefined = data.staking.pool_address;

  return (
    <Box>
      <Center>
        <Text p={5} textAlign={"center"}>
          All timestamps relative to {tz}.
        </Text>
      </Center>
      <Flex>
        <Box w={"33%"} p={5}>
          <Heading p={5} textAlign={"center"}>
            Vesting Schedule
          </Heading>
          <Center>
            {additionalInfoMessage ? (
              <Text textAlign={"center"} paddingBottom={5}>
                {additionalInfoMessage}
              </Text>
            ) : null}
          </Center>
          <VestingTimeline
            data={data}
            stakerGrantAmountApt={stakerGrantAmountApt}
          />
        </Box>
        <Box w={"33%"} p={5}>
          <Heading p={5} textAlign={"center"}>
            Rewards
          </Heading>
          {stakingPoolAddress ? (
            <RewardsInfo stakingPoolAddress={stakingPoolAddress} />
          ) : null}
        </Box>
      </Flex>
    </Box>
  );
};

// We allow the user to pass in a beneficiary address. This function takes the
// address they gave and tries to search the beneficiaries map to do a value
// to key lookup to get the original staker account address, since that is the
// key used for the grant_pool. If no value -> key map is found, we just return
// the address given.
function getStakerAccountAddress(resourceData: any, address: string): string {
  const beneficiaries = resourceData.beneficiaries.data;
  console.log(`beneficiaries: ${JSON.stringify(beneficiaries)}`);
  for (const item of beneficiaries) {
    if (item.value === address) {
      return item.key;
    }
  }
  return address;
}

function getStakerGrantAmount(
  resourceData: any,
  stakerAddress: string | null,
): bigint | null {
  if (stakerAddress === undefined) {
    return null;
  }
  const shares = resourceData.grant_pool.shares.data;
  const amount: string | undefined = shares.find(
    (item: any) => item.key === stakerAddress,
  )?.value;
  if (amount === undefined) {
    return null;
  }
  return BigInt(amount);
}
