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
import { colourPicker } from "../formatting/colourPicker";
import { formatStorage } from "../formatting/formatStorage";

import dayjs from "dayjs";
import "dayjs/locale/en-au";

const DateFilterContext = React.createContext(null);

function PreparePlotData(
  searchProp,
  dataProp,
  inData,
  missingaction = "zero",
  missingtslookahead = 6,
  fromDate,
  toDate
) {
  var data2: { [key: number]: object } = {};
  var usageSum: { [key: number]: number } = {};
  var proplist: string[] = [];
  var allts: number[] = [];
  var firstRealTimestampForProp = {};

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
    if (missingaction === "prev") {
      if (!(x[searchProp] in firstRealTimestampForProp)) {
        firstRealTimestampForProp[x[searchProp]] = ts;
      }
    }
  });

  proplist.sort((a, b) => usageSum[b] - usageSum[a]);
  // Enforce a hard-limit of 30 'props' here
  proplist = proplist.slice(0, 30);

  // Now fill gaps where we've missed all timestamps
  let currentDate = fromDate.unix();
  while (currentDate < Math.max(...allts)) {
    console.log(currentDate);
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

  allts.sort();

  // Now fill in the missing data
  allts.forEach((key, index) => {
    proplist.forEach((proj) => {
      if (!(proj in data2[key])) {
        if (missingaction == "zero") {
          data2[key][proj] = 0.0;
        } else if (missingaction == "prev") {
          if (index > 0) {
            data2[key][proj] = data2[allts[index - 1]][proj];
          } else {
            // For the 0-th index, grab the first real bit of data we have
            data2[key][proj] = data2[firstRealTimestampForProp[proj]][proj];
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
        />
        <YAxis type="number" tickFormatter={formatSUint} />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        {projectlist.map((project, index) => {
          return (
            <Area
              dataKey={project}
              type="monotone"
              stroke={colourPicker(index)}
              fill={colourPicker(index)}
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
        />
        <YAxis type="number" tickFormatter={formatSUint} />
        <Tooltip />
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
        />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        {projectlist.map((project, index) => {
          return (
            <Area
              dataKey={project}
              type="monotone"
              stroke={colourPicker(index)}
              fill={colourPicker(index)}
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
        />
        <Tooltip />
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
