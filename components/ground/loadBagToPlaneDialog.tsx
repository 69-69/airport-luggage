'use client';

import * as React from 'react';
import {
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {DataRow} from "@/types/dataRow";
import {AutocompleteDropdown} from "@/components/dropdown";
import {
    bagLocations,
    clearErrorAndSet, clearErrorAndSetString, isNumeric,
    statuses
} from "@/utils/util";

interface LoadBagDialogProps {
    open: boolean;
    onClose: () => void;
    onLoadBag: (row: DataRow) => void;
}

const LoadBagToPlaneDialog = ({
                             open,
                             onClose,
                             onLoadBag,
                         }: LoadBagDialogProps) => {

    const [passengerStatus, setPassengerStatus] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [bagId, setBagId] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = () => {
        if (bagId.length < 6 || !isNumeric(bagId)) {
            setError('Bag ID is required');
            return;
        }
        if(location.length < 2) {
            setError('Location is required');
            return;
        }
        if(passengerStatus.length < 3) {
            setError('Passenger Status is required');
            return;
        }

        setError('');
        onLoadBag({
            bagId: bagId,
            location: location,
            passengerStatus: passengerStatus,
        });
        onClose();
    };

    let inputAdornment = <><InputAdornment
        position="start"
        sx={{bgcolor: 'rgba(109,184,236,0.8)', py: 0.1, px: 1, borderRadius: 1}}
    >
        <Typography color="error">Auto</Typography>
    </InputAdornment></>;

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Load Bags"
            onConfirm={handleChange}
            cancelLabel={'Cancel'}
            confirmDisabled={!bagId || !location || !passengerStatus}
            confirmLabel={'Load Bags to Plane'}
            content={
                <>
                    <AutocompleteDropdown
                        label="Location" data={[' ',...bagLocations]}
                        value={location}
                        onChange={clearErrorAndSetString(setLocation, setError)}
                    />
                    <AutocompleteDropdown
                        label="Passenger Status" data={[' ',...statuses]}
                        value={passengerStatus}
                        onChange={clearErrorAndSetString(setPassengerStatus, setError)}
                    />
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                    {/*<TextField
                        label="Bag ID"
                        type="text"
                        fullWidth
                        size="small"
                        value={bagId}
                        disabled={bagId.length==6}
                        onChange={clearErrorAndSet(setBagId, setError)}
                        slotProps={{
                            input: {
                                id: 'bag-id',
                                startAdornment: inputAdornment,
                                inputProps: {minLength: 6, maxLength: 6}
                            },
                        }}
                    />*/}

                </>
            }/>
    );
}

export default LoadBagToPlaneDialog;

