import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc)

export function alignTime(intime: dayjs.Dayjs) {
    var outtime = intime.utc();
    // Data from the API updates 4 times a day, at around 0030, 0630
    // 1230 and 1830 UTC. It doesn't matter if the data is half an hour or
    // so out of date, so adjust the timestamp to the nearest hour after
    // one of those times. Javascript modulo is broken
    if ( intime.minute() < 30 && [1,7,13,19].includes(intime.hour()) ) {
        // Between 0100-0130, 0700-0730, 1300-1330 or 1900-1930 UTC, we may not have new data yet, so go
        // back to the previous point
        outtime = outtime.subtract(6,'hours');
    } else {
        // All other times, round it.
        outtime = outtime.hour(Math.floor((((intime.utc().hour()-1)%24)+24)%24/6)*6+1);
    }
    outtime = outtime.set('minute',30).set('second',0).set('millisecond',0);
    return outtime;
}