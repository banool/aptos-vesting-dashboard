import { Tr, Td, Input } from "@chakra-ui/react";
import { Types } from "aptos";
import { UseQueryResult } from "react-query";
import { useGetAccountResource } from "../../api/hooks/useGetAccountResource";
import { isValidAccountAddress } from "../../utils";

// TODO: Consider just maing this return the 3 tds with the results, and control
// the input field elsewhere maybe. Also consider using useQueries.
type RowInfoProps = {
  response: UseQueryResult<Types.MoveResource> | undefined;
};

export const RowInfo = ({ response }: RowInfoProps) => {
  let tdElements = (
    <>
      <Td></Td>
      <Td></Td>
      <Td></Td>
    </>
  );

  if (response === undefined) {
    return tdElements;
  }

  const { isLoading, data: accountResource, error } = response;

  const getTdMessage = (message: string) => {
    return (
      <>
        <Td>{message}</Td>
        <Td></Td>
        <Td></Td>
      </>
    );
  };

  if (error) {
    tdElements = getTdMessage(
      `Error fetching vesting contract: ${JSON.stringify(error)}`,
    );
  } else if (isLoading) {
    tdElements = getTdMessage("Loading...");
  } else if (
    accountResource === undefined ||
    accountResource.data === undefined
  ) {
    tdElements = getTdMessage("Resource unexpectedly undefined");
  } else {
    tdElements = <>todo</>;
  }

  return tdElements;
};
