'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, Container,
    Paper, Typography, Button, Alert,

} from '@mui/material';
import React, {ReactNode} from "react";
import {DataRow} from "@/types/dataRow";
import {toCamelCase} from "@/utils/util";

interface TableProps<T extends DataRow> {
    name?: string;
    title?: string;
    comp?: React.ElementType;
    tableSize?: "small" | "medium";
    topButton?: ReactNode;
    topAlignment?: 'left' | 'center' | 'right' | 'justify';
    columns: string[];          // keys, in display order
    rows: T[];
    onActionCallback?: (row: T) => void;
    onStatusCallback?: (row: T) => void;
    onOptCallback?: (row: T) => void;
    align?: "left" | "center" | "right";
}


function getButton<T>(
    i: number,
    label: string,
    row?: T,
    isText?: boolean,
    onStatusCallback?: (row: T) => void
) {
    return (
        <Button
            key={i}
            size="small"
            color="error"
            variant={isText ? "text" : "outlined"}
            sx={{textTransform: "none"}}
            onClick={() => row && onStatusCallback?.(row)}
        >
            {label}
        </Button>
    );
}


const UITable = <T extends DataRow>({
                                        columns,
                                        rows,
                                        title,
                                        comp,
                                        tableSize,
                                        name,
                                        align,
                                        topButton,
                                        topAlignment,
                                        onActionCallback,
                                        onOptCallback,
                                        onStatusCallback
                                    }: TableProps<T>) => {
    const tableAlign = align ?? "center";

    return (
        <Container sx={{width: '100%', p: 2, /*ml: {md: 30}*/}}>
            <>
                {title && (
                    <Typography variant="h4" component="h1" sx={{textAlign: 'center', mb: 1}} gutterBottom>
                        {title}
                    </Typography>
                )}
                {name && (
                    <Typography variant="h6" fontWeight='normal' sx={{textAlign: 'center', mb: 5}} gutterBottom>
                        <b>Welcome</b>, {name}!
                    </Typography>
                )}
            </>
            {rows && rows.length > 0 ?
                (
                    <TableContainer component={comp ?? Paper}>
                        <Table size={tableSize ?? "medium"}>
                            <TableHead>
                                {/* Full-width button row */}
                                {topButton && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + 1} align={topAlignment ?? 'right'}>
                                            {topButton}
                                        </TableCell>
                                    </TableRow>
                                )}

                                {/* Column headers */}
                                <TableRow>
                                    <TableCell align={tableAlign} sx={{fontWeight: 'bold'}}>#</TableCell>
                                    {columns.map((col) => (
                                        <TableCell key={col} sx={{fontWeight: 'bold'}} align={tableAlign}>
                                            {col.toUpperCase()}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {rows.map((row, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell align={tableAlign}>{i + 1}</TableCell>

                                        {columns.map((col) => (
                                            <TableCell key={col} align={tableAlign}>
                                                {col === "action" || col === "manage" ? (
                                                    getButton<T>(i, row[col] as string, row, false, onActionCallback)
                                                ) : col === "status" || col === "update" ? (
                                                    getButton<T>(i, row[col] as string, row, col === "status", onStatusCallback)
                                                ) : col === "view" ? (
                                                    getButton<T>(i, row[col] as string, row, true, onOptCallback !== null ? onOptCallback : onStatusCallback)
                                                ) : (
                                                    row[toCamelCase(col)]
                                                )}

                                            </TableCell>

                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Container
                        sx={{
                            flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', textAlign: 'center',
                            mt: 4, ml: 6
                        }}
                    >
                        <Alert severity='info' sx={{mb: 2}}>No data found for this page.</Alert>
                        {topButton && (topButton)}
                    </Container>

                )}
        </Container>
    );
}

export default UITable;

