import { useListContext } from "react-admin";
import React, { useContext } from "react";
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";

import { formatSUint } from "../formatting/formatSUint";
import { formatSU } from "../formatting/formatSU";
import { colourPicker } from "../formatting/colourPicker";
import { formatStorage } from "../formatting/formatStorage";
import { specialUsers } from "../data/groups";

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en-au";

const DateFilterContext = React.createContext(null);

const RenderTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{dayjs.unix(label).format("YYYY-MM-DD h:mm A")}</p>
        <ul>
          {payload.map((entry, index: Number) => (
            <li key={`item-${index}`} style={{ color: entry.color }}>{`${
              entry.name in specialUsers ? specialUsers[entry.name] : entry.name
            }: ${formatter(entry.value)}`}</li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

function PreparePlotData(
  searchProp: string,
  dataProp: string,
  inData,
  missingaction: string = "zero",
  missingtslookahead: number = 6,
  fromDate: Dayjs,
  toDate: Dayjs
) {
  var data2: { [key: number]: object } = {};
  var usageSum: { [key: number]: number } = {};
  var proplist: string[] = [];
  var allts: number[] = [];
  var firstRealTimestampForProp: { [key: string]: number } = {};

  inData.forEach((x) => {
    let ts = dayjs(x.ts).unix();
    allts.indexOf(ts) === -1 && allts.push(ts);
    if (!(ts in data2)) {
      data2[ts] = {};
    }
    if (!(x[searchProp] in usageSum)) {
      usageSum[x[searchProp]] = x[dataProp];
    } else {
      usageSum[x[searchProp]] += x[dataProp];
    }
    if (!(x[searchProp] in data2[ts])) {
      data2[ts][x[searchProp]] = x[dataProp];
    } else {
      data2[ts][x[searchProp]] += x[dataProp];
    }
    if (!proplist.includes(x[searchProp])) {
      proplist.push(x[searchProp]);
    }
    if (!(x[searchProp] in firstRealTimestampForProp)) {
      firstRealTimestampForProp[x[searchProp]] = ts;
    }
  });

  proplist.sort((a, b) => usageSum[b] - usageSum[a]);
  // Enforce a hard-limit of 30 'props' here
  proplist = proplist.slice(0, 30);

  // Now fill gaps where we've missed all timestamps

  // If we're zeroing missing data, only go to the final real timestep
  // If we're interpolating, go all the way to the end of the graph
  let extent = Math.max(...allts);
  if (missingaction == "prev") {
    extent = toDate.unix();
  }

  let currentDate = fromDate.unix();
  while (currentDate < extent) {
    const existsInRange = allts.some((timestamp) => {
      return (
        timestamp > currentDate &&
        timestamp < currentDate + missingtslookahead * 2 * 3600
      );
    });
    if (!existsInRange) {
      allts.push(currentDate);
      data2[currentDate] = {};
    }
    currentDate = currentDate + missingtslookahead * 3600;
  }

  // And the start-of-graph timestep
  const ts = fromDate.unix();
  if (allts.indexOf(ts) === -1) {
    allts.push(ts);
    data2[ts] = {};
  }

  allts.sort();

  // Now fill in the missing data
  allts.forEach((key, index) => {
    proplist.forEach((proj) => {
      if (!(proj in data2[key])) {
        if (key > ts) {
          if (missingaction == "zero") {
            data2[key][proj] = 0.0;
          } else if (missingaction == "prev") {
            data2[key][proj] = data2[allts[index - 1]][proj];
          }
        } else {
          // For any time before and including the start of the
          // graph, grab the first real bit of data we have
          // But only if its close enough to the start of the window
          if (
            firstRealTimestampForProp[proj] <
            ts + 4 * missingtslookahead * 3600
          ) {
            data2[key][proj] = data2[firstRealTimestampForProp[proj]][proj];
          } else {
            data2[key][proj] = 0.0;
          }
        }
      }
    });
  });

  var dataArray = [];
  for (const [key, value] of Object.entries(data2)) {
    let tmpobj = { id: parseInt(key) };
    let newobj = { ...value, ...tmpobj };

    dataArray.push(newobj);
  }

  dataArray.sort((a, b) => a.id - b.id);
  return { dataArray, proplist };
}

function MakeComputeGraphUser() {
  const listContext = useListContext();
  const { fromDate, toDate } = useContext(DateFilterContext);
  if (listContext.isLoading) return null;
  const { dataArray, proplist: projectlist } = PreparePlotData(
    "project",
    "usage",
    listContext.data,
    "zero",
    6,
    fromDate,
    toDate
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={dataArray}>
        <XAxis
          dataKey="id"
          type="number"
          tickFormatter={(x) => dayjs.unix(x).format("YYYY-MM-DD")}
          domain={[fromDate.unix(), toDate.unix()]}
          tickMargin={8}
          style={{ fontWeight: 500 }}
          allowDataOverflow
        />
        <YAxis
          type="number"
          tickFormatter={formatSUint}
          width={80}
          tickMargin={5}
          style={{ fontWeight: 500 }}
        />
        <Tooltip
          content={<RenderTooltip formatter={formatSU} />}
          wrapperStyle={{
            backgroundColor: "white",
            paddingLeft: "5px",
            paddingRight: "5px",
            opacity: "0.8",
          }}
        />
        <Legend />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        {projectlist.map((project, index) => {
          return (
            <Area
              dataKey={project}
              type="monotone"
              stroke={colourPicker(index)}
              fill={colourPicker(index)}
              fillOpacity="1"
              stackId="1"
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MakeComputeGraphProj() {
  const { fromDate, toDate } = useContext(DateFilterContext);
  const listContext = useListContext();
  if (listContext.isLoading) return null;
  const { dataArray, proplist: userlist } = PreparePlotData(
    "user",
    "usage",
    listContext.data,
    "zero",
    6,
    fromDate,
    toDate
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={dataArray}>
        <XAxis
          dataKey="id"
          type="number"
          tickFormatter={(x) => dayjs.unix(x).format("YYYY-MM-DD")}
          domain={[fromDate.unix(), toDate.unix()]}
          tickMargin={8}
          style={{ fontWeight: 500 }}
          allowDataOverflow
        />
        <YAxis
          type="number"
          tickFormatter={formatSUint}
          width={80}
          style={{ fontWeight: 500 }}
        />
        <Tooltip
          content={<RenderTooltip formatter={formatSU} />}
          wrapperStyle={{
            backgroundColor: "white",
            paddingLeft: "5px",
            paddingRight: "5px",
            opacity: "0.8",
          }}
        />
        <Legend />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        {userlist.map((user, index) => {
          let stackId = "1";
          let opacity = 1;
          if (user == "total") {
            stackId = "2";
            opacity = 0;
          } else if (user == "grant") {
            stackId = "3";
            opacity = 0;
          }
          return (
            <Area
              dataKey={user}
              type="monotone"
              stroke={colourPicker(index)}
              fill={colourPicker(index)}
              fillOpacity={opacity}
              stackId={stackId}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MakeStorageGraphUser() {
  const listContext = useListContext();
  const { fromDate, toDate, storageType } = useContext(DateFilterContext);

  if (listContext.isLoading) return null;

  const { dataArray, proplist: projectlist } = PreparePlotData(
    "location",
    storageType,
    listContext.data,
    "prev",
    6,
    fromDate,
    toDate
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={dataArray}>
        <XAxis
          dataKey="id"
          type="number"
          tickFormatter={(x) => dayjs.unix(x).format("YYYY-MM-DD")}
          domain={[fromDate.unix(), toDate.unix()]}
          tickMargin={8}
          style={{ fontWeight: 500 }}
          allowDataOverflow
        />
        <YAxis
          type="number"
          tickFormatter={(x) => {
            if (storageType == "size") {
              return formatStorage(x);
            } else {
              return x.toLocaleString();
            }
          }}
          width={80}
          style={{ fontWeight: 500 }}
        />
        <Tooltip
          content={
            <RenderTooltip
              formatter={
                storageType == "size"
                  ? formatStorage
                  : (x) => x.toLocaleString()
              }
            />
          }
          wrapperStyle={{
            backgroundColor: "white",
            paddingLeft: "5px",
            paddingRight: "5px",
            opacity: "0.8",
          }}
        />
        <Legend />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        {projectlist.map((project, index) => {
          return (
            <Area
              dataKey={project}
              type="monotone"
              stroke={colourPicker(index)}
              fill={colourPicker(index)}
              fillOpacity="1"
              stackId="1"
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MakeStorageGraphProj() {
  const { fromDate, toDate, storageType } = useContext(DateFilterContext);
  const listContext = useListContext();
  if (listContext.isLoading) return null;
  const { dataArray, proplist: userlist } = PreparePlotData(
    "user",
    storageType,
    listContext.data,
    "prev",
    6,
    fromDate,
    toDate
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={dataArray}>
        <XAxis
          dataKey="id"
          type="number"
          tickFormatter={(x) => dayjs.unix(x).format("YYYY-MM-DD")}
          domain={[fromDate.unix(), toDate.unix()]}
          tickMargin={8}
          style={{ fontWeight: 500 }}
          allowDataOverflow
        />
        <YAxis
          type="number"
          tickFormatter={(x) => {
            if (storageType == "size") {
              return formatStorage(x);
            } else {
              return x.toLocaleString();
            }
          }}
          width={80}
          style={{ fontWeight: 500 }}
        />
        <Tooltip
          content={
            <RenderTooltip
              formatter={
                storageType == "size"
                  ? formatStorage
                  : (x: number) => x.toLocaleString()
              }
            />
          }
          wrapperStyle={{
            backgroundColor: "white",
            paddingLeft: "5px",
            paddingRight: "5px",
            opacity: "0.8",
          }}
        />
        <Legend />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        {userlist.map((user, index) => {
          let stackId = "1";
          let opacity = 1;
          if (user == "total") {
            stackId = "2";
            opacity = 0;
          } else if (user == "grant") {
            stackId = "3";
            opacity = 0;
          }
          return (
            <Area
              dataKey={user}
              type="monotone"
              stroke={colourPicker(index)}
              fill={colourPicker(index)}
              fillOpacity={opacity}
              stackId={stackId}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export {
  DateFilterContext,
  MakeComputeGraphUser,
  MakeComputeGraphProj,
  MakeStorageGraphUser,
  MakeStorageGraphProj,
};
