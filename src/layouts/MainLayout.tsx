import React from "react";
import { Box, Flex, Heading, IconButton, Spacer, Text } from "@chakra-ui/react";
import { ColorModeSwitcher } from "../components/ColorModeSwitcher";
import NetworkSelect from "../components/NetworkSelect";
import { useGetAptToUsd } from "../api/hooks/useGetAptToUsd";

interface LayoutProps {
  children: React.ReactNode;
}

// TODO: Figure out how to make IconButton padding for GitHub button the same
// as the color switcher button.
export default function MainLayout({ children }: LayoutProps) {
  const { isLoading, aptToUsd, error } = useGetAptToUsd();

  let headerMiddle = null;
  if (isLoading) {
    headerMiddle = <Text>Loading APT price...</Text>;
  }
  if (aptToUsd) {
    headerMiddle = <Text>{`1 APT = ${aptToUsd.toFixed(2)} USD`}</Text>;
  }
  if (!isLoading && aptToUsd === undefined) {
    headerMiddle = <Text>Error loading APT price, see console logs</Text>;
    console.log("Error loading APT price:");
    console.log(error);
  }

  return (
    <Box>
      <Box paddingTop={5} paddingBottom={5} paddingLeft={8} paddingRight={8}>
        <Flex minWidth="max-content" alignItems="center" gap="2">
          <Box>
            <Heading size="md">Aptos Vesting Dashboard</Heading>
          </Box>
          <Spacer />
          {headerMiddle}
          <Spacer />
          <a href="https://github.com/banool/aptos-vesting-dashboard">
            <IconButton
              size="xs"
              fontSize="sm"
              variant="ghost"
              color="current"
              icon={
                <svg
                  viewBox="0 0 16 16"
                  focusable="false"
                  className="chakra-icon css-ag1zpf"
                >
                  <path
                    fill="currentColor"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                  ></path>
                </svg>
              }
              aria-label={`View source code on GitHub`}
            />
          </a>
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
