import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Box, Center, Text, Flex, Spacer } from "@chakra-ui/react";
import { ConnectWalletComponent } from "../../components/ConnectWalletComponent";
import { DisconnectWalletComponent } from "../../components/DisconnectWalletComponent";
import { Body } from "./Body";

export const InteractPage = () => {
  const { connected } = useWallet();

  let walletConnectComponent = null;
  if (connected) {
    walletConnectComponent = <DisconnectWalletComponent />;
  } else {
    walletConnectComponent = <ConnectWalletComponent />;
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <>
      <Flex p={1} alignContent="center">
        <Spacer />
        <Box p={4}>{walletConnectComponent}</Box>
        <Center p={4}>
          <Box>{`Timezone: ${tz}`}</Box>
        </Center>
        <Spacer />
      </Flex>
      <Center>
        <Box w="800px" p={2}>
          <Text textAlign={"center"}>{}</Text>
        </Box>
      </Center>
      <Body />
    </>
  );
};
