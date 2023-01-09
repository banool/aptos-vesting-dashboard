import * as React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  Card,
  VStack,
  Code,
  Grid,
  theme,
} from "@chakra-ui/react";

type TimelineItems = {
  title: string;
  unixTimeSecs: number;
};

type TimelineProps = {
  // The order here is not respected, we just sort by unixTimeSecs.
  items: TimelineItems[];
};

export const Timeline = ({ items }: TimelineProps) => {
  // Returns a vertical timeline of items, where each item is a card with a
  // small vertical line between them. Each card should have the title and
  // then as the subtitle a pretty formatted date.
  return (
    <VStack>
      {items.map((item) => (
        <Card>
          <Text>{item.title}</Text>
          <Text>{item.unixTimeSecs}</Text>
        </Card>
      ))}
    </VStack>
  );
};
