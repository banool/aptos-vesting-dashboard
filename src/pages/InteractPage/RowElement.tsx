import { Tr, Td, Input } from "@chakra-ui/react";

type RowElementProps = {
  address: string;
  updateAddresses: React.Dispatch<React.SetStateAction<string[]>>;
  index: number;
};

export const RowElement = ({
  address,
  updateAddresses,
  index,
}: RowElementProps) => {
  const handleOnInputPaste = (event: any) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text/plain");
    const newAddresses = pasted.split(/[\s,\n]+/);
    updateAddresses(newAddresses);
  };

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
      <Td>✅</Td>
      <Td>✅</Td>
      <Td>✅</Td>
    </Tr>
  );
};
