import {
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  PrevNextButtons,
  ReferenceManyField,
  FunctionField,
  useRecordContext,
  WithListContext,
  useListContext,
  Button,
  TabbedShowLayout,
  Datagrid,
} from "react-admin";

import React, { useState } from "react";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import dayjs from "dayjs";
import "dayjs/locale/en-au";

import { formatSU } from "../../util/formatting/formatSU";
import { formatStorage } from "../../util/formatting/formatStorage";
import { groupQuotaProjects } from "../../util/data/groups";
import { StorageNote } from "../../util/data/storagenote";
import {
  MakeComputeGraphProj,
  MakeStorageGraphProj,
  DateFilterContext,
} from "../../util/plotting/computePlot";
import {
  LinkToUserWithPrefix,
  LinkToGroupWithPrefix,
} from "../../util/linking";
import { alignTime } from "../../util/data/alignTime";

const PostTitle = () => {
  const record = useRecordContext();
  if (!record) return null;
  return <span>Project {record.id}</span>;
};

function quotaField() {
  // Do something really dodgy
  if (groupQuotaProjects.includes(window.location.hash.split("/")[2])) {
    return "ownership";
  } else {
    return "location";
  }
}

export const GroupPage = () => {
  const [users, setUserList] = useState([]);
  const [fromDate, setFromDate] = useState(dayjs().subtract(14, "day"));
  const [toDate, setToDate] = useState(dayjs());
  const [alignment, setAlignment] = useState("size");

  const datefilter =
    fromDate && toDate
      ? {
          ts: [
            alignTime(fromDate).toISOString(),
            alignTime(toDate).toISOString(),
          ],
        }
      : {};

  const PostBulkActionButtons = () => {
    const { resource, selectedIds } = useListContext();
    var newUserList = [];
    if (resource === "storage_latest") {
      newUserList = selectedIds.map((k) => k.split("_")[2]);
    } else if (resource === "compute_latest") {
      newUserList = selectedIds.map((k) => k.split("_")[1]);
    }

    const handleFilterButtonClick = () => {
      setUserList(newUserList);
    };

    const handleResetButtonClick = () => {
      setUserList([]);
    };

    return (
      <>
        <Button label="Reset Filter" onClick={handleResetButtonClick} />
        <Button label="Filter Graph" onClick={handleFilterButtonClick} />
      </>
    );
  };

  const handleStorageTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    setAlignment(newAlignment);
  };

  const userFilter = users.length != 0 ? { user: users } : {};
  const totalFilter = { ...userFilter, ...datefilter };

  return (
    <Show
      title={<PostTitle />}
      actions={
        <TopToolbar>
          <PrevNextButtons linkType="show" />
        </TopToolbar>
      }
    >
      <DateFilterContext.Provider
        value={{ fromDate: fromDate, toDate: toDate, storageType: alignment }}
      >
        <SimpleShowLayout>
          <TextField source="id" label="Group Name" />
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-au"
          >
            <DatePicker
              label="From"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              minDate={dayjs("2023-09-05")}
            />
            <DatePicker
              label="To"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              minDate={dayjs("2023-09-05")}
            />
            <Button
              label="Reset Dates"
              variant="contained"
              size="large"
              sx={{ margin: 1.5 }}
              onClick={() => {
                setFromDate(dayjs().subtract(14, "day"));
                setToDate(dayjs());
              }}
            />
          </LocalizationProvider>
        </SimpleShowLayout>
        <TabbedShowLayout>
          <TabbedShowLayout.Tab label="Compute">
            <ReferenceManyField
              label="Compute usage over time"
              target="project"
              reference="compute"
              sort={{ field: "ts", order: "ASC" }}
              filter={totalFilter}
              perPage={99999}
            >
              <WithListContext render={MakeComputeGraphProj} />
            </ReferenceManyField>
            <ReferenceManyField
              label="Compute usage by User"
              target="project"
              reference="compute_latest"
              sort={{ field: "usage", order: "DESC" }}
              perPage={9999}
            >
              <Datagrid bulkActionButtons={<PostBulkActionButtons />}>
                <FunctionField
                  label="User"
                  render={(record) => LinkToUserWithPrefix(record.user)}
                  sortBy="user"
                  source="user"
                />
                <FunctionField
                  label="SU Usage"
                  render={(record) => `${formatSU(record.usage)}`}
                  sortBy="usage"
                  source="usage"
                />
              </Datagrid>
            </ReferenceManyField>
          </TabbedShowLayout.Tab>
          <TabbedShowLayout.Tab label="/scratch" path="scratch">
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={handleStorageTypeChange}
              aria-label="Type"
            >
              <ToggleButton value="size">Storage Capacity</ToggleButton>
              <ToggleButton value="inodes">File Counts</ToggleButton>
            </ToggleButtonGroup>
            <ReferenceManyField
              label="/scratch usage over time"
              target="location"
              reference="storage"
              sort={{ field: "ts", order: "ASC" }}
              filter={{ fs: "scratch", ...totalFilter }}
              perPage={99999}
            >
              <WithListContext render={MakeStorageGraphProj} />
            </ReferenceManyField>
            <StorageNote />
            <ReferenceManyField
              label="/scratch usage by user"
              target="location"
              reference="storage_latest"
              sort={{ field: "size", order: "DESC" }}
              filter={{ fs: "scratch" }}
              perPage={9999}
            >
              <Datagrid bulkActionButtons={<PostBulkActionButtons />}>
                <FunctionField
                  label="User"
                  render={(record) => LinkToUserWithPrefix(record.user)}
                  sortBy="user"
                  source="user"
                />
                <FunctionField
                  label="Directory"
                  render={(record) =>
                    LinkToGroupWithPrefix(
                      record.location,
                      "/scratch",
                      "scratch"
                    )
                  }
                  sortBy="location"
                  source="location"
                />
                <FunctionField
                  label="Group Ownership"
                  render={(record) => LinkToGroupWithPrefix(record.ownership)}
                  sortBy="ownership"
                  source="ownership"
                />
                <FunctionField
                  label="Data Usage"
                  render={(record) => `${formatStorage(record.size)}`}
                  sortBy="size"
                  source="size"
                />
                <FunctionField
                  label="# Files"
                  render={(record) => `${record.inodes.toLocaleString()}`}
                  sortBy="inodes"
                  source="inodes"
                />
              </Datagrid>
            </ReferenceManyField>
          </TabbedShowLayout.Tab>
          <TabbedShowLayout.Tab label="/g/data" path="gdata">
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={handleStorageTypeChange}
              aria-label="Type"
            >
              <ToggleButton value="size">Storage Capacity</ToggleButton>
              <ToggleButton value="inodes">File Counts</ToggleButton>
            </ToggleButtonGroup>
            <ReferenceManyField
              label="/g/data usage over time"
              target={quotaField()}
              reference="storage"
              sort={{ field: "ts", order: "ASC" }}
              filter={{ fs: "gdata", ...totalFilter }}
              perPage={99999}
            >
              <WithListContext render={MakeStorageGraphProj} />
              <StorageNote />
            </ReferenceManyField>
            <ReferenceManyField
              label="/g/data usage by user"
              target={quotaField()}
              reference="storage_latest"
              sort={{ field: "size", order: "DESC" }}
              filter={{ fs: "gdata" }}
              perPage={9999}
            >
              <Datagrid bulkActionButtons={<PostBulkActionButtons />}>
                <FunctionField
                  label="User"
                  render={(record) => LinkToUserWithPrefix(record.user)}
                  sortBy="user"
                  source="user"
                />
                <FunctionField
                  label="Directory"
                  render={(record) =>
                    LinkToGroupWithPrefix(record.location, "/g/data", "gdata")
                  }
                  sortBy="location"
                  source="location"
                />
                <FunctionField
                  label="Group Ownership"
                  render={(record) => LinkToGroupWithPrefix(record.ownership)}
                  sortBy="ownership"
                  source="ownership"
                />
                <FunctionField
                  label="Data Usage"
                  render={(record) => `${formatStorage(record.size)}`}
                  sortBy="size"
                  source="size"
                />
                <FunctionField
                  label="# Files"
                  render={(record) => `${record.inodes.toLocaleString()}`}
                  sortBy="inodes"
                  source="inodes"
                />
              </Datagrid>
            </ReferenceManyField>
          </TabbedShowLayout.Tab>
          <TabbedShowLayout.Tab label="massdata" path="massdata">
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={handleStorageTypeChange}
              aria-label="Type"
            >
              <ToggleButton value="size">Storage Capacity</ToggleButton>
              <ToggleButton value="inodes">File Counts</ToggleButton>
            </ToggleButtonGroup>
            <ReferenceManyField
              label="massdata usage over time"
              target="location"
              reference="storage"
              sort={{ field: "ts", order: "ASC" }}
              filter={{ fs: "massdata", ...totalFilter }}
              perPage={99999}
            >
              <WithListContext render={MakeStorageGraphProj} />
            </ReferenceManyField>
            <ReferenceManyField
              label="massdata usage"
              target="location"
              reference="storage_latest"
              sort={{ field: "size", order: "DESC" }}
              filter={{ fs: "massdata" }}
              perPage={9999}
            >
              <Datagrid bulkActionButtons={false}>
                <TextField label="" sortBy="user" source="user" />
                <TextField
                  label="Project"
                  sortBy="location"
                  source="location"
                />
                <FunctionField
                  label="Data Usage"
                  render={(record) => `${formatStorage(record.size)}`}
                  sortBy="size"
                  source="size"
                />
                <FunctionField
                  label="# Files"
                  render={(record) => `${record.inodes.toLocaleString()}`}
                  sortBy="inodes"
                  source="inodes"
                />
              </Datagrid>
            </ReferenceManyField>
          </TabbedShowLayout.Tab>
        </TabbedShowLayout>
      </DateFilterContext.Provider>
    </Show>
  );
};
