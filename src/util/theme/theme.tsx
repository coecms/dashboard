import { defaultTheme } from "react-admin";
import {
  clex_primary_colours,
  clex_secondary_colours_light,
  clex_secondary_colours_dark,
} from "./colours";
import { setUncaughtExceptionCaptureCallback } from "process";

const dashboardTheme = {
    ...defaultTheme,
    palette: {
        background: {default: '#f1f1f1'},
    },
    typography: {
        fontFamily: [
            'Ubuntu',
            'sans-serif',
        ].join(','),
    },
    components: {
        ...defaultTheme.components,
        RaAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: clex_secondary_colours_dark['blue'],
                },
            },
        },
        RaDatagridHeaderCell: {
            styleOverrides: {
                root: {
                    fontSize: 16,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    color:"inherit",
                }
            }
        },
        RaDatagrid: {
            styleOverrides: {
                root: {
                    "& .RaDatagrid-clickableRow": {
                        ":hover": {
                            backgroundColor: clex_secondary_colours_dark["purple"],
                            color: "white",
                          },
                    }
                }
            }
        },
    },
};

export {dashboardTheme};