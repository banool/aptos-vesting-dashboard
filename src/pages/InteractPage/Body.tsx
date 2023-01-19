import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Tooltip,
  Button,
  Td,
  Input,
} from "@chakra-ui/react";
import React, { ReactNode, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAccountResourceMany } from "../../api/hooks/useGetAccountResourceMany";
import { RowInfo } from "./RowInfo";

type BodyProps = {};

export const Body = ({}: BodyProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [addresses, updateAddresses] = useState<string[]>([]);

  // This uses useQueries internally to fetch all the data in parallel.
  const responses = useGetAccountResourceMany(
    addresses,
    "0x1::vesting::VestingContract",
  );

  // Set the addresses based on the query params.
  useEffect(() => {
    const vestingContractAddressRaw = searchParams.get(
      "vesting_contract_addresses",
    );
    if (vestingContractAddressRaw) {
      updateAddresses(vestingContractAddressRaw.split(","));
    }
  }, [searchParams]);

  // Update the query params based on changes to the addresses.
  useEffect(() => {
    updateAddressQueryParams(addresses);
  }, [addresses, updateAddresses]);

  const updateAddressQueryParams = (newAddresses: string[]) => {
    let paramUpdate: any = {};
    if (newAddresses.length > 0) {
      paramUpdate.vesting_contract_addresses = newAddresses.join(",");
    }
    setSearchParams((prev) => {
      return { ...prev, ...paramUpdate };
    });
  };

  const handleOnInputPaste = (event: any) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text/plain");
    const newAddresses = pasted.split(/[\s,\n]+/);
    updateAddresses(newAddresses);
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
            minW="650px"
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
                return newAddresses;
              });
            }}
            placeholder="0x96daeefd..."
          />
        </Td>
        {tdElements}
      </Tr>
    );
  };

  // Create rows for each address.
  let rows = addresses.map((address, index) => {
    if (address === "") {
      return;
    }
    return getRowFrame(address, index, <RowInfo response={responses[index]} />);
  });

  // Create an additional row for further input.
  rows.push(
    getRowFrame("", addresses.length, <RowInfo response={undefined} />),
  );

  let clearButton = null;
  if (addresses.length > 0) {
    clearButton = (
      <Button
        onClick={() => {
          updateAddresses([]);
          updateAddressQueryParams([]);
        }}
      >
        Clear
      </Button>
    );
  }

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
      {clearButton}
    </Box>
  );
};
