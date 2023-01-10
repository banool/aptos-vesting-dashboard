import { useGetAptToUsd } from "../api/hooks/useGetAptToUsd";
import { formatUsdAmount, numberToFractionString } from "../utils";
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
  const { aptToUsd } = useGetAptToUsd();

  const vestingSchedule = data.vesting_schedule;
  const startTimestampSecs = BigInt(vestingSchedule.start_timestamp_secs);
  const periodDuration = BigInt(vestingSchedule.period_duration);

  // https://github.com/facebook/create-react-app/issues/6907#issuecomment-778178677
  // https://github.com/facebook/create-react-app/issues/11705
  const exponent = Math.pow(2, 32);

  // Build the first set of items from the on chain data.
  let timeTracker = startTimestampSecs;
  let items: VestingTimelineItem[] = [];
  for (const item of vestingSchedule.schedule) {
    // https://stackoverflow.com/a/54409977/3846032
    const rawValue = BigInt(item.value);
    const precision = 100_000n;
    const fraction =
      Number((rawValue * precision) / BigInt(exponent)) / Number(precision);

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
  // TODO: I think this math may be incorrect, double check.
  const numberOfEventsToAdd = Math.floor(remainingFraction / lastFraction);
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
    let amountString = "";
    if (amountApt !== null) {
      amountString += `${amountApt} APT`;
    }
    if (amountApt !== null && aptToUsd) {
      amountString += ` - ${formatUsdAmount(Number(amountApt) * aptToUsd)}`;
    }
    timelineItems.push({
      title: fraction,
      body: amountString,
      unixTimeSecs: item.unixTimeSecs,
    });
  }
  return <Timeline items={timelineItems} />;
};
