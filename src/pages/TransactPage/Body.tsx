import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Tooltip,
  Text,
  Button,
  Td,
  Input,
  Link,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Center,
  CardFooter,
  Heading,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAccountResource } from "../../api/hooks/useGetAccountResource";
import { useGetAccountResourceMany } from "../../api/hooks/useGetAccountResourceMany";
import { vest, unlockRewards, distribute } from "../../api/transactions";
import { useGlobalState } from "../../GlobalState";
import {
  canCallDistributeMany,
  canCallUnlockRewardsMany,
  canCallVestMany,
} from "./validationMany";
import { RowInfo } from "./RowInfo";
import { CanCallStatus } from "./validation";

type BodyProps = {
  bypassValidation: boolean;
};

export const Body = ({ bypassValidation }: BodyProps) => {
  console.log(`byPassValidation: ${bypassValidation}`);
  const [globalState] = useGlobalState();

  const [searchParams, setSearchParams] = useSearchParams();

  const toast = useToast();

  const [addresses, updateAddresses] = useState<string[]>([]);

  const { signAndSubmitTransaction } = useWallet();

  const [awaitingTransaction, setAwaitingTransaction] = useState(false);

  // This uses useQueries internally to fetch all the data in parallel.
  const responses = useGetAccountResourceMany(
    addresses,
    "0x1::vesting::VestingContract",
  );

  // Create staking addresses if we have them.
  let stakingAddresses = [];
  for (const response of responses) {
    const data = response.data?.data;
    if (data) {
      stakingAddresses.push((data as any).staking.pool_address);
    } else {
      stakingAddresses.push(undefined);
    }
  }

  // Get the staking resource for each of the vesting contracts.
  const stakePoolResponses = useGetAccountResourceMany(
    stakingAddresses,
    "0x1::stake::StakePool",
  );

  console.log(`stakePoolResponses: ${JSON.stringify(stakePoolResponses)}`);

  const configurationResponse = useGetAccountResource(
    "0x1",
    "0x1::reconfiguration::Configuration",
  );

  const updateAddressesWrapper = useCallback(
    (newAddresses: string[]) => {
      updateAddresses(newAddresses);
      let paramUpdate: any = {};
      if (newAddresses.length > 0) {
        paramUpdate.vesting_contract_addresses = newAddresses.join(",");
      }
      setSearchParams((prev) => {
        return { ...prev, ...paramUpdate };
      });
    },
    [setSearchParams],
  );

  // Set the addresses based on the query params.
  useEffect(() => {
    const vestingContractAddressRaw = searchParams.get(
      "vesting_contract_addresses",
    );
    if (vestingContractAddressRaw) {
      updateAddressesWrapper(vestingContractAddressRaw.split(","));
    }
  }, [searchParams, updateAddressesWrapper]);

  const handleOnInputPaste = (event: any) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text/plain");
    const newAddresses = pasted.split(/[\s,\n]+/);
    updateAddressesWrapper(newAddresses);
  };

  const getRowFrame = (
    address: string,
    index: number,
    tdElements: ReactNode,
  ) => {
    const onPaste = index === 0 ? handleOnInputPaste : undefined;
    return (
      <Tr key={index}>
        <Td w="1px">
          <Input
            value={address}
            minW="675px"
            onPaste={onPaste}
            onChange={(event) => {
              let newAddresses = [...addresses];
              // Handle removing an item if the address is changed to an empty string.
              if (event.target.value === "") {
                newAddresses.splice(index, 1);
              } else {
                newAddresses[index] = event.target.value;
              }
              updateAddressesWrapper(newAddresses);
            }}
            placeholder="0x96daeefd..."
          />
        </Td>
        {tdElements}
      </Tr>
    );
  };

  // Create rows for each address.
  let rows = [];
  for (const [index, address] of addresses.entries()) {
    if (address === "") {
      continue;
    }
    rows.push(
      getRowFrame(
        address,
        index,
        <RowInfo
          vestingContractResponse={responses[index]}
          configurationResponse={configurationResponse}
          stakePoolResponse={stakePoolResponses[index]}
        />,
      ),
    );
  }

  // Create an additional row for further input.
  rows.push(
    getRowFrame(
      "",
      addresses.length,
      <RowInfo
        vestingContractResponse={undefined}
        configurationResponse={undefined}
        stakePoolResponse={undefined}
      />,
    ),
  );

  let clearButton = null;
  if (addresses.length > 0) {
    clearButton = (
      <>
        {" "}
        <Link
          onClick={() => {
            updateAddressesWrapper([]);
          }}
        >
          Clear
        </Link>
      </>
    );
  }

  const handleVestTransaction = () => {
    const inner = async () => {
      setAwaitingTransaction(true);
      try {
        await vest(
          signAndSubmitTransaction,
          globalState.network_value,
          addresses,
        );
        // If we get here, the transaction was committed successfully on chain.
        toast({
          title: "Success!",
          description:
            "Transaction to call vest for these contracts was successful!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (e) {
        toast({
          title: "Failed!",
          description: "Error: " + e,
          status: "error",
          duration: 7000,
          isClosable: true,
        });
      }
      setAwaitingTransaction(false);
    };

    inner();
  };

  const handleUnlockRewardsTransaction = () => {
    const inner = async () => {
      setAwaitingTransaction(true);
      try {
        await unlockRewards(
          signAndSubmitTransaction,
          globalState.network_value,
          addresses,
        );
        // If we get here, the transaction was committed successfully on chain.
        toast({
          title: "Success!",
          description:
            "Transaction to call unlock_rewards for these contracts was successful!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (e) {
        toast({
          title: "Failed!",
          description: "Error: " + e,
          status: "error",
          duration: 7000,
          isClosable: true,
        });
      }
      setAwaitingTransaction(false);
    };

    inner();
  };

  const handleDistributeTransaction = () => {
    const inner = async () => {
      setAwaitingTransaction(true);
      try {
        await distribute(
          signAndSubmitTransaction,
          globalState.network_value,
          addresses,
        );
        // If we get here, the transaction was committed successfully on chain.
        toast({
          title: "Success!",
          description:
            "Transaction to call distribute for these contracts was successful!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (e) {
        toast({
          title: "Failed!",
          description: "Error: " + e,
          status: "error",
          duration: 7000,
          isClosable: true,
        });
      }
      setAwaitingTransaction(false);
    };

    inner();
  };

  const canVest = canCallVestMany(
    responses,
    configurationResponse,
    bypassValidation,
  );
  const canUnlockRewards = canCallUnlockRewardsMany(
    responses,
    stakePoolResponses,
    configurationResponse,
    bypassValidation,
  );
  const canDistribute = canCallDistributeMany(responses, bypassValidation);

  const vestCard = getButtonCard({
    header: "Vest",
    onClick: handleVestTransaction,
    canCallStatus: canVest.canCallStatus,
    explanation: canVest.reason,
  });

  const unlockRewardsCard = getButtonCard({
    header: "Unlock Rewards",
    onClick: handleUnlockRewardsTransaction,
    canCallStatus: canUnlockRewards.canCallStatus,
    explanation: canUnlockRewards.reason,
  });

  const distributeCard = getButtonCard({
    header: "Distribute",
    onClick: handleDistributeTransaction,
    canCallStatus: canDistribute.canCallStatus,
    explanation: canDistribute.reason,
  });

  return (
    <Box>
      <TableContainer p={4} w="100%">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>
                Vesting Contract Addresses{" "}
                <Tooltip
                  label="If you have many vesting contracts in your clipboard (one per line / space separated / comma separated) you can paste them into the first input field below and it'll expand out automatically."
                  placement="auto"
                >
                  ⓘ
                </Tooltip>
                {clearButton}
              </Th>
              <Th>
                Vest Unlockable{" "}
                <Tooltip
                  label="Whether a vest event has occured but the coins have not been unlocked yet."
                  placement="auto"
                >
                  ⓘ
                </Tooltip>
              </Th>
              <Th>
                Reward Unlockable{" "}
                <Tooltip
                  label="Whether any staking rewards are unlockable but have not been unlocked yet."
                  placement="auto"
                >
                  ⓘ
                </Tooltip>
              </Th>
              <Th>
                Coins Distributable{" "}
                <Tooltip
                  label="Whether any coins have been unlocked but have not been distributed yet."
                  placement="auto"
                >
                  ⓘ
                </Tooltip>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <>{rows}</>
          </Tbody>
        </Table>
      </TableContainer>
      <Box w="100%">
        <Center>
          <Flex>
            {vestCard}
            {unlockRewardsCard}
            {distributeCard}
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

type ButtonCardProps = {
  header: string;
  explanation: string;
  canCallStatus: CanCallStatus;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

const getButtonCard = ({
  header,
  explanation,
  canCallStatus,
  onClick,
}: ButtonCardProps) => {
  let headerText;
  switch (canCallStatus) {
    case "canCall":
      headerText = "✅";
      break;
    case "cannotCall":
      headerText = "❌";
      break;
    case "loading":
      headerText = "⏳";
      break;
  }
  return (
    <Card margin={3} minW="350px" maxW="350px">
      <CardHeader>
        <Flex>
          <Heading size="md">{header}</Heading>
          <Spacer />
          <Text>{headerText}</Text>
        </Flex>
      </CardHeader>
      <CardBody>{explanation}</CardBody>
      <CardFooter>
        <Button onClick={onClick} disabled={canCallStatus !== "canCall"}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
};
