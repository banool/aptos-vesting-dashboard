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

export const LandingPage = () => {
  const [vestingContractAddress, updateVestingContractAddress] = useState("");
  const [beneficiaryAddress, updateBeneficiaryAddress] = useState("");

  const [vestingContractAddressIsValid, updateVestingContractAddressIsValid] =
    useState(false);
  const [beneficiaryAddressIsValid, updateBeneficiaryAddressIsValid] =
    useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // Load up the inital query params if they're valid.
  useEffect(() => {
    const vestingContractAddressRaw = searchParams.get(
      "vesting_contract_address",
    );
    if (vestingContractAddressRaw) {
      handleAddressUpdate(
        vestingContractAddressRaw,
        updateVestingContractAddress,
        updateVestingContractAddressIsValid,
      );
    }
    const beneficiaryAddressRaw = searchParams.get("beneficiary_address");
    if (beneficiaryAddressRaw) {
      handleAddressUpdate(
        beneficiaryAddressRaw,
        updateBeneficiaryAddress,
        updateBeneficiaryAddressIsValid,
      );
    }
  }, [searchParams]);

  // Update the query params if the addresses were updated and they're valid.
  useEffect(() => {
    let params: any = {};
    if (vestingContractAddressIsValid) {
      params.vesting_contract_address = vestingContractAddress;
    }
    if (beneficiaryAddressIsValid) {
      params.beneficiary_address = beneficiaryAddress;
    }
    setSearchParams(params);
  }, [
    vestingContractAddress,
    beneficiaryAddress,
    vestingContractAddressIsValid,
    beneficiaryAddressIsValid,
    setSearchParams,
  ]);

  let prompt = null;
  if (!vestingContractAddressIsValid) {
    if (vestingContractAddress === "") {
      prompt = "Please enter a vesting contract address (0x + 64 chars)";
    } else if (vestingContractAddress.length > 0) {
      prompt = "Keep typing!";
    } else {
      prompt = "Address format invalid!";
    }
  }

  const handleAddressUpdate = (
    newValue: string,
    updateValue: React.Dispatch<React.SetStateAction<string>>,
    updateIsValid: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    updateValue(newValue);
    updateIsValid(isValidAccountAddress(newValue));
  };

  return (
    <Box>
      <Center>
        <Box w={"60%"} p={10}>
          <Stack gap="5">
            <InputGroup>
              <InputLeftAddon minW="175px" children="Vesting contract" />
              <Input
                value={vestingContractAddress}
                onChange={(event) =>
                  handleAddressUpdate(
                    event.target.value,
                    updateVestingContractAddress,
                    updateVestingContractAddressIsValid,
                  )
                }
                placeholder="0x3c3b0d0f..."
              />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon minW="175px" children="Beneficiary" />
              <Input
                value={beneficiaryAddress}
                onChange={(event) =>
                  handleAddressUpdate(
                    event.target.value,
                    updateBeneficiaryAddress,
                    updateBeneficiaryAddressIsValid,
                  )
                }
                placeholder="0x96daeefd..."
              />
            </InputGroup>
            {prompt ? <Text>{prompt}</Text> : null}
          </Stack>
        </Box>
      </Center>
      {vestingContractAddressIsValid ? (
        <Body
          vestingContractAddress={vestingContractAddress}
          beneficiaryAddress={beneficiaryAddress}
        />
      ) : null}
    </Box>
  );
};
