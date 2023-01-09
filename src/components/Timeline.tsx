import {
  Box,
  Text,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Center,
  Divider,
  Spacer,
  Flex,
} from "@chakra-ui/react";
import { getDatetimePretty } from "../utils";

export type TimelineItem = {
  title: string;
  body: string;
  unixTimeSecs: bigint;
};

interface TimelineCardProps {
  item: TimelineItem;
}

const TimelineCard = ({
  item: { title, body, unixTimeSecs },
}: TimelineCardProps) => {
  return (
    <Card margin={3}>
      <CardHeader paddingBottom={0}>
        <Flex>
          <Heading size="sm">{getDatetimePretty(Number(unixTimeSecs))}</Heading>
          <Spacer />
          <Heading size="md">{title}</Heading>
        </Flex>
      </CardHeader>
      <CardBody>
        <Text textAlign={"center"}>{body}</Text>
      </CardBody>
    </Card>
  );
};

export type TimelineProps = {
  // The order here is not respected, we just sort by unixTimeSecs.
  items: TimelineItem[];
};

export const Timeline = ({ items }: TimelineProps) => {
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt.
  items = items.sort((a, b) =>
    a.unixTimeSecs < b.unixTimeSecs
      ? -1
      : a.unixTimeSecs > b.unixTimeSecs
      ? 1
      : 0,
  );

  // Returns a vertical timeline of items, where each item is a card with a
  // small vertical line between them. Each card should have the title and
  // then as the subtitle a pretty formatted date.
  let components = [<TimelineCard key={0} item={items[0]} />];
  let key = 1;
  for (const item of items.slice(1)) {
    components.push(
      <Center key={key} height="25px">
        <Divider borderWidth="1px" orientation="vertical" />
      </Center>,
    );
    components.push(<TimelineCard key={key + 1} item={item} />);
    key += 2;
  }

  return <Box overflowY={"auto"}>{components}</Box>;
};
