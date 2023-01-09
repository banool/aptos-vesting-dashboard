import React from "react";
import { Box, Flex, Heading, Spacer } from "@chakra-ui/react";
import { ColorModeSwitcher } from "../components/ColorModeSwitcher";
import NetworkSelect from "../components/NetworkSelect";

interface LayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: LayoutProps) {
  return (
    <Box>
      <Box paddingTop={5} paddingBottom={5} paddingLeft={8} paddingRight={8}>
        <Flex minWidth="max-content" alignItems="center" gap="2">
          <Box>
            <Heading size="md">Aptos Vesting Dashboard</Heading>
          </Box>
          <Spacer />
          <ColorModeSwitcher />
          <Box>
            <NetworkSelect />
          </Box>
        </Flex>
      </Box>
      {children}
    </Box>
  );
}
