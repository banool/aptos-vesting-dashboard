import { numberToFractionString } from "../utils";
import { Timeline } from "./Timeline";

export type VestingTimelineItem = {
  fraction: number;
  unixTimeSecs: bigint;
};

export type VestingTimelineProps = {
  data: any;
  stakerGrantAmountApt: bigint | null;
};

export const VestingTimeline = ({
  data,
  stakerGrantAmountApt,
}: VestingTimelineProps) => {
  const vestingSchedule = data.vesting_schedule;
  const startTimestampSecs = BigInt(vestingSchedule.start_timestamp_secs);
  const periodDuration = BigInt(vestingSchedule.period_duration);

  // Build the first set of items from the on chain data.
  let timeTracker = startTimestampSecs;
  let items: VestingTimelineItem[] = [];
  for (const item of vestingSchedule.schedule) {
    // https://stackoverflow.com/a/54409977/3846032
    const rawValue = BigInt(item.value);
    const exponent = 2n ** 32n;
    const precision = 100_000_000n;
    const fraction =
      Number((rawValue * precision) / exponent) / Number(precision);
    items.push({
      fraction,
      unixTimeSecs: timeTracker,
    });
    timeTracker += periodDuration;
  }

  // Fill in the rest if necessary based on any implied additional vest events
  // if the fraction hasn't been "filled in" yet.
  const totalFractionSoFar = items
    .map((item) => item.fraction)
    .reduce((partialSum, a) => partialSum + a, 0);
  const remainingFraction = 1 - totalFractionSoFar;
  const lastFraction = items[items.length - 1].fraction;
  const numberOfEventsToAdd = remainingFraction / lastFraction;
  let latestUnixtime = items[items.length - 1].unixTimeSecs;
  for (let i = 0; i < numberOfEventsToAdd; i++) {
    items.push({
      fraction: lastFraction,
      unixTimeSecs: latestUnixtime + periodDuration,
    });
    latestUnixtime += periodDuration;
  }

  let timelineItems = [];
  for (const item of items) {
    const amountApt = stakerGrantAmountApt
      ? (Number(stakerGrantAmountApt) * item.fraction).toFixed(2)
      : null;
    const fraction = numberToFractionString(item.fraction);
    const amountString = amountApt !== null ? `${amountApt} APT` : "";
    timelineItems.push({
      title: fraction,
      body: amountString,
      unixTimeSecs: item.unixTimeSecs,
    });
  }
  return <Timeline items={timelineItems} />;
};
