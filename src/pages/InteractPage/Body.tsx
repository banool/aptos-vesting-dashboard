import {
  Box,
  SimpleGrid,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Input,
  Flex,
  Center,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAccountResource } from "../../api/hooks/useGetAccountResource";

type BodyProps = {};

export const Body = ({}: BodyProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [addresses, updateAddresses] = useState<string[]>([]);

  useEffect(() => {
    const vestingContractAddressRaw = searchParams.get(
      "vesting_contract_addresses",
    );
    if (vestingContractAddressRaw) {
      updateAddresses(vestingContractAddressRaw.split(","));
    }
  }, [searchParams]);

  const handleOnInputPaste = (event: any) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text/plain");
    const newAddresses = pasted.split(/[\s,\n]+/);
    updateAddresses(newAddresses);
    updateAddressQueryParams(newAddresses);
  };

  const updateAddressQueryParams = (newAddresses: string[]) => {
    let paramUpdate: any = {};
    if (newAddresses.length > 0) {
      paramUpdate.vesting_contract_addresses = newAddresses.join(",");
    }
    setSearchParams((prev) => {
      return { ...prev, ...paramUpdate };
    });
  };

  const getRowElement = (value: string, index: number) => {
    const onPaste = index === 0 ? handleOnInputPaste : undefined;
    return (
      <Tr key={index}>
        <Td>
          <Input
            minW="650px"
            value={value}
            onPaste={onPaste}
            onChange={(event) => {
              updateAddresses((addresses) => {
                let newAddresses = [...addresses];
                // Handle removing an item if the address is changed to an empty string.
                if (event.target.value === "") {
                  newAddresses.splice(index, 1);
                } else {
                  newAddresses[index] = event.target.value;
                }
                updateAddressQueryParams(newAddresses);
                return newAddresses;
              });
            }}
            placeholder="0x96daeefd..."
          />
        </Td>
        <Td>✅</Td>
        <Td>✅</Td>
        <Td>✅</Td>
      </Tr>
    );
  };

  // Create rows for each address.
  let rows = addresses.map((address, index) => {
    return getRowElement(address, index);
  });

  // Create an additional row for further input.
  rows.push(getRowElement("", addresses.length));

  return (
    <Flex>
      <TableContainer p={4} minW={"80%"}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>
                Vesting Contract Addresses{" "}
                <Tooltip
                  label="If you have many vesting contracts in your clipboard (one per line / space separated / comma separated) you can paste them into the first input field below and it'll expand out automatically."
                  placement="auto"
                >
                  ℹ️
                </Tooltip>
              </Th>
              <Th>
                Vest Unlockable{" "}
                <Tooltip
                  label="Whether a vest event has occured but the coins have not been unlocked yet."
                  placement="auto"
                >
                  ℹ️
                </Tooltip>
              </Th>
              <Th>
                Reward Unlockable{" "}
                <Tooltip
                  label="Whether any staking rewards are unlockable but have not been unlocked yet."
                  placement="auto"
                >
                  ℹ️
                </Tooltip>
              </Th>
              <Th>
                Coins Distributable{" "}
                <Tooltip
                  label="Whether any coins have been unlocked but have not been distributed yet."
                  placement="auto"
                >
                  ℹ️
                </Tooltip>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <>{rows}</>
          </Tbody>
        </Table>
      </TableContainer>
      <Box p={4} paddingTop={12}>
        <Text>{"hey"}</Text>
      </Box>
    </Flex>
  );
};
