import {
  Box,
  Center,
  Input,
  InputGroup,
  InputLeftAddon,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isValidAccountAddress } from "../../utils";
import { Body } from "./Body";

export const ExplorePage = () => {
  const [vestingContractAddress, updateVestingContractAddress] = useState("");
  const [maybeBeneficiaryAddress, updateMaybeBeneficiaryAddress] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  // Load up the inital query params if they're valid.
  useEffect(() => {
    const vestingContractAddressRaw = searchParams.get(
      "vesting_contract_address",
    );
    if (vestingContractAddressRaw) {
      updateVestingContractAddress(vestingContractAddressRaw);
    }
    const maybeBeneficiaryAddressRaw = searchParams.get("beneficiary_address");
    if (maybeBeneficiaryAddressRaw) {
      updateMaybeBeneficiaryAddress(maybeBeneficiaryAddressRaw);
    }
  }, [searchParams]);

  // Update the query params if the addresses were updated and they're valid.
  useEffect(() => {
    let paramUpdate: any = {};
    if (isValidAccountAddress(vestingContractAddress)) {
      paramUpdate.vesting_contract_address = vestingContractAddress;
    }
    if (isValidAccountAddress(maybeBeneficiaryAddress)) {
      paramUpdate.beneficiary_address = maybeBeneficiaryAddress;
    }
    setSearchParams((prev) => {
      return { ...prev, ...paramUpdate };
    });
  }, [
    vestingContractAddress,
    maybeBeneficiaryAddress,
    searchParams,
    setSearchParams,
  ]);

  let prompt = null;
  if (!isValidAccountAddress(vestingContractAddress)) {
    if (vestingContractAddress === "") {
      prompt = "Please enter a vesting contract address (0x + up to 64 chars)";
    } else if (vestingContractAddress.length > 0) {
      prompt = "Keep typing!";
    } else {
      prompt = "Address format invalid!";
    }
  }

  return (
    <Box>
      <Center>
        <Box w={"65%"} p={10}>
          <Stack gap="5">
            <InputGroup>
              <InputLeftAddon minW="175px" children="Vesting contract" />
              <Input
                value={vestingContractAddress}
                onChange={(event) =>
                  updateVestingContractAddress(event.target.value)
                }
                placeholder="0x3c3b0d0f..."
              />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon minW="175px" children="Beneficiary" />
              <Input
                value={maybeBeneficiaryAddress}
                onChange={(event) =>
                  updateMaybeBeneficiaryAddress(event.target.value)
                }
                placeholder="0x96daeefd..."
              />
            </InputGroup>
            {prompt ? (
              <Text p={3} textAlign={"center"}>
                {prompt}
              </Text>
            ) : null}
          </Stack>
        </Box>
      </Center>
      {isValidAccountAddress(vestingContractAddress) ? (
        <Body
          vestingContractAddress={vestingContractAddress}
          maybeBeneficiaryAddress={maybeBeneficiaryAddress}
        />
      ) : null}
    </Box>
  );
};
