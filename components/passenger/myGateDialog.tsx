'use client';

import * as React from 'react';
import UiDialog from "@/components/uiDialog";
import UITable from "@/components/uiTable";
import {DataRow} from "@/types/dataRow";


interface MyGateDialogProps<T extends DataRow> {
    open: boolean;
    onClose: () => void;
    columns: string[];          // keys, in display order
    rows: T[];
}

const MyGateDialog = <T extends DataRow>({
                                            open,
                                            onClose,
                                            rows,
                                            columns,
                                        }: MyGateDialogProps<T>) => {

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Flight Information"
            cancelLabel='Cancel'
            confirmLabel='none'
            content={
                <UITable<T>  comp='span' columns={columns} topAlignment='justify' rows={rows}/>
            }/>
    );
}

export default MyGateDialog;

