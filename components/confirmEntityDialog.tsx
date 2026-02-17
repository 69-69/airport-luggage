'use client';
import * as React from 'react';
import {
    Typography
} from '@mui/material';
import Info from "@mui/icons-material/Info";
import UiDialog from "@/components/uiDialog";

interface ConfirmFlightDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    errored?: string;
    message: React.ReactNode;
    dataId: number | string;
    onConfirm: (proceed: boolean) => void;
}

const ConfirmEntityDialog = (
    {open, onClose, title, errored, message, dataId, onConfirm}: ConfirmFlightDialogProps
) => {
    // const {open, onClose, flightId} = params;

    const [error, setError] = React.useState('');

    const handleConfirm = () => {
        if (!dataId) {
            setError("Something went wrong. kindly try again!");
            return;
        }

        setError('');
        onConfirm(true);
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title={title}
            onConfirm={handleConfirm}
            content={
                <>
                    <Typography
                        component="div"
                        id="confirm-dialog-description"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Info fontSize="small"/>
                        {message}
                    </Typography>
                    {error || errored && (
                        <Typography color="error" variant="body2">
                            {error || errored}
                        </Typography>
                    )}
                </>
            }/>
    );
}

export default ConfirmEntityDialog;
