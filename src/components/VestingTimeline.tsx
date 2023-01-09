import { octaToApt } from "../utils";
import { Timeline } from "./Timeline";
import fractionUnicode from "fraction-unicode";

export type VestingTimelineItem = {
  fraction: number;
  unixTimeSecs: bigint;
};

export type VestingTimelineProps = {
  // The order here is not respected, we just sort by unixTimeSecs.
  items: VestingTimelineItem[];
  stakerGrantAmountOcta: bigint | null;
};

export const VestingTimeline = ({
  items,
  stakerGrantAmountOcta,
}: VestingTimelineProps) => {
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt.
  items = items.sort((a, b) =>
    a.unixTimeSecs < b.unixTimeSecs
      ? -1
      : a.unixTimeSecs > b.unixTimeSecs
      ? 1
      : 0
  );

  const stakerGrantAmountApt = stakerGrantAmountOcta
    ? octaToApt(stakerGrantAmountOcta)
    : null;

  let timelineItems = [];
  for (const item of items) {
    const amountApt = stakerGrantAmountApt
      ? (Number(stakerGrantAmountApt) * item.fraction).toFixed(2)
      : null;
    // TODO: Use fractionUnicode here, e.g. fractionUnicode(1, 2)
    const title =
      amountApt !== null
        ? `${item.fraction}: ${amountApt} APT`
        : `${item.fraction}`;
    timelineItems.push({
      title,
      unixTimeSecs: item.unixTimeSecs,
    });
  }
  return <Timeline items={timelineItems} />;
};
