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
import {Grid} from "@mui/system";
import {clearErrorAndSet, clearErrorAndSetString, isNumeric, manualGates, manualTerminals} from "@/utils/util";

interface MoveBagDialogProps {
    open: boolean;
    onClose: () => void;
    onMoveBag: (row: DataRow) => void;
}

const MoveBagToGateDialog = ({
                                 open,
                                 onClose,
                                 onMoveBag,
                             }: MoveBagDialogProps) => {

    const [ticketNumber, setTicketNumber] = React.useState('');
    const [terminal, setTerminal] = React.useState('');
    const [newGate, setNewGate] = React.useState('');
    const [bagId, setBagId] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = () => {
        if (bagId.length < 6 || !isNumeric(bagId)) {
            setError('Enter valid bag ID');
            return;
        }
        if (ticketNumber.length < 6 || !isNumeric(ticketNumber)) {
            setError('Enter valid ticket number');
            return;
        }
        if (newGate.length < 2) {
            setError('Gate is required');
            return;
        }
        if (terminal.length < 2) {
            setError('Terminal is required');
            return;
        }
        console.log('terminal', terminal);

        setError('');

        onMoveBag({
            bagId: bagId,
            ticketNumber: ticketNumber,
            newGate: newGate,
            terminal: terminal,
        });
        onClose();
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Move Bags"
            onConfirm={handleChange}
            cancelLabel={'Cancel'}
            confirmDisabled={!bagId || !ticketNumber || !newGate || !terminal}
            confirmLabel={'Move Bags to Gate'}
            content={
                <>
                    <Grid container spacing={2}>
                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                label="Bag ID"
                                type="text"
                                fullWidth
                                size="small"
                                value={bagId}
                                onChange={clearErrorAndSet(setBagId, setError)}
                                slotProps={{
                                    input: {
                                        id: 'bag-id',
                                        inputProps: {minLength: 6, maxLength: 6}
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                label="Ticket Number"
                                type="text"
                                fullWidth
                                size="small"
                                value={ticketNumber}
                                onChange={clearErrorAndSet(setTicketNumber, setError)}
                                slotProps={{
                                    input: {
                                        id: 'ticket-number',
                                        inputProps: {minLength: 10, maxLength: 10}
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                    <AutocompleteDropdown
                        label="Terminal" data={[' ', ...manualTerminals]}
                        value={terminal}
                        onChange={clearErrorAndSetString(setTerminal, setError)}
                    />
                    <AutocompleteDropdown
                        label="Gate Number" data={[' ', ...manualGates]}
                        value={newGate}
                        onChange={clearErrorAndSetString(setNewGate, setError)}
                    />
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </>
            }/>
    );
}

export default MoveBagToGateDialog;

