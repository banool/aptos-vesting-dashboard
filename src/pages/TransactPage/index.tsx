import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Center,
  Text,
  Flex,
  Spacer,
  FormControl,
  FormLabel,
  Switch,
  Checkbox,
} from "@chakra-ui/react";
import { useState } from "react";
import { ConnectWalletComponent } from "../../components/ConnectWalletComponent";
import { DisconnectWalletComponent } from "../../components/DisconnectWalletComponent";
import { Body } from "./Body";

export const TransactPage = () => {
  const { connected } = useWallet();

  const [bypassValidation, setBypassValidation] = useState(false);

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
        <Center p={4}>
          <Box>{`Timezone: ${tz}`}</Box>
        </Center>
        <Box p={4}>{walletConnectComponent}</Box>
        <Checkbox
          p={4}
          checked={bypassValidation}
          onChange={() => setBypassValidation((prev) => !prev)}
        >
          Bypass validation
        </Checkbox>
        <Spacer />
      </Flex>
      <Body bypassValidation={bypassValidation} />
    </>
  );
};
