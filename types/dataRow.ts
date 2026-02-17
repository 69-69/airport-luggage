import * as React from "react";

export type DataValue = string | number | boolean | React.ReactNode | null | undefined;
export type DataRow = Record<string, DataValue>;
