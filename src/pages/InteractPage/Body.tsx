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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RowElement } from "./RowElement";

type BodyProps = {};

export const Body = ({}: BodyProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [addresses, updateAddresses] = useState<string[]>([]);

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

  // Create rows for each address.
  let rows = addresses.map((address, index) => {
    return (
      <RowElement
        key={index}
        address={address}
        updateAddresses={updateAddresses}
        index={index}
      />
    );
  });

  // Create an additional row for further input.
  rows.push(
    <RowElement
      key={addresses.length}
      address={""}
      updateAddresses={updateAddresses}
      index={addresses.length}
    />,
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
