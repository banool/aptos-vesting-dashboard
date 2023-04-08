import { Box, Center, Flex, Heading, Text } from "@chakra-ui/react";
import { useGetAccountResource } from "../../api/hooks/useGetAccountResource";
import { useGetAptToUsd } from "../../api/hooks/useGetAptToUsd";
import { RewardsInfo } from "../../components/RewardsInfo";
import { VestingContractInfo } from "../../components/VestingContractInfo";
import { VestingTimeline } from "../../components/VestingTimeline";
import { formatAptAmount, formatUsdAmount, octaToApt } from "../../utils";

type BodyProps = {
  vestingContractAddress: string;
  // This could be the beneficiary or the shareholder address.
  maybeBeneficiaryAddress: string;
};

export const Body = ({
  vestingContractAddress,
  maybeBeneficiaryAddress,
}: BodyProps) => {
  const { isLoading, accountResource, error } = useGetAccountResource(
    vestingContractAddress,
    "0x1::vesting::VestingContract",
  );

  // I have verified that this only gets called once, even if you use this hook
  // in multiple places throughout the code. There must be some sensible default
  // caching mechanism in place.
  const { aptToUsd } = useGetAptToUsd();

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

  if (accountResource === undefined || accountResource.data === undefined) {
    return (
      <Text p={6} textAlign={"center"}>
        Resource unexpectedly undefined
      </Text>
    );
  }

  // Pull out relevant info from the resource from the account with the vesting
  // contract.
  const data = accountResource.data as any;

  // If the beneficiary address doesn't resolve to a different addess for the
  // shareholder address, the beneficiary address must be the shareholder address.
  const addresses = getShareholderAndBeneficiaryAccountAddresses(
    data,
    maybeBeneficiaryAddress,
  );
  const stakerGrantAmount = getStakerGrantAmount(
    data,
    addresses?.shareholderAddress,
  );
  const stakerGrantAmountApt = stakerGrantAmount
    ? octaToApt(stakerGrantAmount)
    : null;
  const stakerGrantAmountUsd =
    stakerGrantAmountApt && aptToUsd
      ? Number(stakerGrantAmountApt) * aptToUsd
      : null;

  let additionalInfoMessage = null;
  if (maybeBeneficiaryAddress === "") {
    additionalInfoMessage =
      "\
        Enter a beneficiary address to see information about how much will vest \
        each cycle. This address can either be the original address you received \
        via email or the new address you provided for your rewards to get paid \
        out to.\
    ";
  }
  if (maybeBeneficiaryAddress.length > 0 && stakerGrantAmount === null) {
    additionalInfoMessage =
      "\
        The given beneficiary address could not be found!\
    ";
  }

  const stakePoolAddress: string | undefined = data.staking.pool_address;

  let stakerGrantTotalComponent = null;
  if (stakerGrantAmountApt) {
    let usdText = "";
    if (stakerGrantAmountUsd) {
      usdText = ` (${formatUsdAmount(stakerGrantAmountUsd)})`;
    }
    stakerGrantTotalComponent = (
      <Text textAlign={"center"} paddingBottom={5} paddingTop={2}>
        {`There is ${formatAptAmount(
          stakerGrantAmountApt,
        )} ${usdText} total in this vesting contract for the given beneficiary address.`}
      </Text>
    );
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Box>
      <Flex>
        <Box w={"33%"} p={5}>
          <Heading p={5} textAlign={"center"}>
            Vesting Schedule
          </Heading>
          <Center></Center>
          <VestingTimeline
            data={data}
            stakerGrantAmountApt={stakerGrantAmountApt}
          />
        </Box>
        <Box w={"33%"} p={5}>
          <Heading p={5} textAlign={"center"}>
            Vesting Contract
          </Heading>
          <VestingContractInfo
            vestingContractAddress={vestingContractAddress}
            resourceData={data}
          />
          <Heading p={5} textAlign={"center"}>
            Beneficiary Info
          </Heading>
          {stakerGrantAmountApt !== null ? (
            <>
              <Text textAlign={"center"} paddingBottom={5} paddingTop={2}>
                {`There is ${formatAptAmount(stakerGrantAmountApt)} (${
                  stakerGrantAmountUsd !== null
                    ? formatUsdAmount(stakerGrantAmountUsd!)
                    : ""
                }) total in this vesting contract for the given beneficiary address.`}
              </Text>
            </>
          ) : null}
          {additionalInfoMessage ? (
            <Text textAlign={"center"} paddingBottom={5} paddingTop={2}>
              {additionalInfoMessage}
            </Text>
          ) : null}
          <Heading p={5} textAlign={"center"}>
            Timestamps
          </Heading>
          <Center>
            <Text p={3} textAlign={"center"}>
              All timestamps are relative to {tz}.
            </Text>
          </Center>
        </Box>
        <Box w={"33%"} p={5}>
          <Heading p={5} textAlign={"center"}>
            Rewards
          </Heading>
          {stakePoolAddress ? (
            <RewardsInfo
              vestingContractAddress={vestingContractAddress}
              beneficiaryAddress={addresses?.beneficiaryAddress}
              stakePoolAddress={stakePoolAddress}
              vestingContractData={data}
            />
          ) : null}
        </Box>
      </Flex>
    </Box>
  );
};

type Addresses = {
  shareholderAddress: string;
  beneficiaryAddress: string;
};

// Given an address (which could be either), return the beneficiary and shareholder
// address. If the address is not found at all, return null.
function getShareholderAndBeneficiaryAccountAddresses(
  resourceData: any,
  address: string,
): Addresses | null {
  const beneficiaries = resourceData.beneficiaries.data;
  // First look through the beneficiaries map.
  for (const item of beneficiaries) {
    if (item.value === address || item.key === address) {
      return {
        shareholderAddress: item.key,
        beneficiaryAddress: item.value,
      };
    }
  }
  // Now look through the shareholders list.
  for (const item of resourceData.grant_pool.shareholders) {
    if (item === address) {
      return item;
    }
  }
  return null;
}

function getBeneficiaryAccountAddress(
  resourceData: any,
  address: string,
): string {
  const beneficiaries = resourceData.beneficiaries.data;
  for (const item of beneficiaries) {
    if (item.value === address) {
      return item.key;
    }
  }
  return address;
}

function getStakerGrantAmount(
  resourceData: any,
  shareholderAccountAddress: string | undefined,
): bigint | null {
  if (shareholderAccountAddress === undefined) {
    return null;
  }
  const shares = resourceData.grant_pool.shares.data;
  const amount: string | undefined = shares.find(
    (item: any) => item.key === shareholderAccountAddress,
  )?.value;
  if (amount === undefined) {
    return null;
  }
  return BigInt(amount);
}
