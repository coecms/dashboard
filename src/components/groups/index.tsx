import {
  Datagrid,
  FunctionField,
  TextInput,
  List,
  TextField,
  useGetManyReference,
  useListContext,
  useRecordContext,
} from "react-admin";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import { formatSU } from "../../util/formatting/formatSU";
import { formatStorage } from "../../util/formatting/formatStorage";

import { DeprecationNote } from "../../util/data/deprecationnote";

import { clex_secondary_colours_dark } from "../../util/theme/colours";

import React from "react";

const groupFilters = [
  <TextInput
    source="id"
    label="Group Search"
    alwaysOn
    resettable
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton>
            <SearchIcon />
          </IconButton>
        </InputAdornment>
      ),
    }}
  />,
];

function ComputeUsage() {
  const listContext = useListContext();
  const recordContext = useRecordContext();

  if (!recordContext)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );
  if (listContext.isLoading)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );

  const usersOnPage = listContext.data.map((x) => x.id);

  // I know this is wrong and I don't care. It means one call to the API per page
  // instead of one call per entry
  const { data, isLoading, error } = useGetManyReference("compute_latest", {
    target: "PartitionKey",
    id: "1",
    filter: { project: usersOnPage },
    pagination: { page: 1, perPage: 999 },
  });

  if (isLoading)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );
  if (error)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Error...
      </Typography>
    );
  if (!data)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        0 SU
      </Typography>
    );

  var compute_usage = data.reduce(function (sum, i) {
    if (i.project === recordContext.id) {
      if (i.user != "total" && i.user != "grant") {
        sum += Number(i.usage);
      }
    }
    return sum;
  }, 0.0);

  return (
    <Typography component="span" variant="body2" textAlign="right">
      {formatSU(compute_usage)}
    </Typography>
  );
}

function ScratchUsage() {
  const listContext = useListContext();
  const recordContext = useRecordContext();

  if (!recordContext)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );
  if (listContext.isLoading)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );

  const usersOnPage = listContext.data.map((x) => x.id);

  // I know this is wrong and I don't care. It means one call to the API per page
  // instead of one call per entry
  const { data, isLoading, error } = useGetManyReference(
    "storage_project_latest",
    {
      target: "PartitionKey",
      id: "1",
      filter: { project: usersOnPage, fs: "scratch" },
      pagination: { page: 1, perPage: 999 },
    }
  );

  if (isLoading)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );
  if (error)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Error...
      </Typography>
    );
  if (!data)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        0 SU
      </Typography>
    );

  var scratch_usage = data.reduce(function (sum, i) {
    if (i.project === recordContext.id) {
      if (i.user != "total" && i.user != "grant") {
        sum += Number(i.usage);
      }
    }
    return sum;
  }, 0.0);

  return (
    <Typography component="span" variant="body2" textAlign="right">
      {formatStorage(scratch_usage)}
    </Typography>
  );
}

function GdataUsage() {
  const listContext = useListContext();
  const recordContext = useRecordContext();

  if (!recordContext)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );
  if (listContext.isLoading)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );

  const usersOnPage = listContext.data.map((x) => x.id);

  // I know this is wrong and I don't care. It means one call to the API per page
  // instead of one call per entry
  const { data, isLoading, error } = useGetManyReference(
    "storage_project_latest",
    {
      target: "PartitionKey",
      id: "1",
      filter: { project: usersOnPage, fs: "gdata" },
      pagination: { page: 1, perPage: 999 },
    }
  );

  if (isLoading)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );
  if (error)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Error...
      </Typography>
    );
  if (!data)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        0 SU
      </Typography>
    );

  var gdata_usage = data.reduce(function (sum, i) {
    if (i.project === recordContext.id) {
      if (i.user != "total" && i.user != "grant") {
        sum += Number(i.usage);
      }
    }
    return sum;
  }, 0.0);

  return (
    <Typography component="span" variant="body2" textAlign="right">
      {formatStorage(gdata_usage)}
    </Typography>
  );
}

function MassdataUsage() {
  const listContext = useListContext();
  const recordContext = useRecordContext();

  if (!recordContext)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );
  if (listContext.isLoading)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );

  const usersOnPage = listContext.data.map((x) => x.id);

  // I know this is wrong and I don't care. It means one call to the API per page
  // instead of one call per entry
  const { data, isLoading, error } = useGetManyReference(
    "storage_project_latest",
    {
      target: "PartitionKey",
      id: "1",
      filter: { project: usersOnPage, fs: "massdata" },
      pagination: { page: 1, perPage: 999 },
    }
  );

  if (isLoading)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Loading...
      </Typography>
    );
  if (error)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        Error...
      </Typography>
    );
  if (!data)
    return (
      <Typography component="span" variant="body2" textAlign="right">
        0 SU
      </Typography>
    );

  var massdata_usage = data.reduce(function (sum, i) {
    if (i.project === recordContext.id) {
      if (i.user != "total" && i.user != "grant") {
        sum += Number(i.usage);
      }
    }
    return sum;
  }, 0.0);

  return (
    <Typography component="span" variant="body2" textAlign="right">
      {formatStorage(massdata_usage)}
    </Typography>
  );
}

export const GroupList = () => {
  return (
    <div>
    <DeprecationNote />
    <List filters={groupFilters}>
      <Datagrid
        rowClick="show"
        bulkActionButtons={false}
        hover={false}
      >
        <TextField source="id" label="Group Name" />
        <FunctionField label="Compute Usage" render={ComputeUsage} />
        <FunctionField label="Scratch Usage" render={ScratchUsage} />
        <FunctionField label="/g/data Usage" render={GdataUsage} />
        <FunctionField label="Massdata Usage" render={MassdataUsage} />
      </Datagrid>
    </List>
    </div>
  );
};
