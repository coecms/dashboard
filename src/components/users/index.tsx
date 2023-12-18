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

import { clex_secondary_colours_dark } from "../../util/theme/colours";

const userFilters = [
  <TextInput
    source="id"
    label="Username Search"
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
  <TextInput
    source="pw_name"
    label="User Search"
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
    filter: { user: usersOnPage },
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
    if (i.user === recordContext.id) {
      sum += Number(i.usage);
    }
    return sum;
  }, 0.0);

  return (
    <Typography component="span" variant="body2" textAlign="right">
      {formatSU(compute_usage)}
    </Typography>
  );
}

function gdataUsage() {
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
  const { data, isLoading, error } = useGetManyReference("storage_latest", {
    target: "PartitionKey",
    id: "1",
    filter: { user: usersOnPage, fs: "gdata" },
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
        0.00 kB
      </Typography>
    );

  var gdata_usage = data.reduce(function (sum, i) {
    if (i.user === recordContext.id) {
      sum += Number(i.size);
    }
    return sum;
  }, 0.0);

  return (
    <Typography component="span" variant="body2" textAlign="right">
      {formatStorage(gdata_usage)}
    </Typography>
  );
}

function scratchUsage() {
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
  const { data, isLoading, error } = useGetManyReference("storage_latest", {
    target: "PartitionKey",
    id: "1",
    filter: { user: usersOnPage, fs: "scratch" },
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
        0.00 B
      </Typography>
    );

  var scratch_usage = data.reduce(function (sum, i) {
    if (i.user === recordContext.id) {
      sum += Number(i.size);
    }
    return sum;
  }, 0.0);

  return (
    <Typography component="span" variant="body2" textAlign="right">
      {formatStorage(scratch_usage)}
    </Typography>
  );
}

export const UserList = () => {
  return (
    <List filters={userFilters} sx={{ padding: 2 }}>
      <Datagrid
        rowClick="show"
        bulkActionButtons={false}
        sx={{
          "& .MuiTableRow-hover": {
            ":hover": {
              backgroundColor: clex_secondary_colours_dark["purple"],
              color: "white",
            },
          },
          "& .MuiTableCell-root": {
            color: "inherit",
          },
        }}
      >
        <TextField source="id" label="Username" />
        <TextField source="pw_name" label="Name" />
        <FunctionField
          label="Compute Usage across all projects"
          render={ComputeUsage}
        />
        <FunctionField
          label="Data on /scratch across all projects"
          render={scratchUsage}
        />
        <FunctionField
          label="Data on /g/data across all projects"
          render={gdataUsage}
        />
      </Datagrid>
    </List>
  );
};
