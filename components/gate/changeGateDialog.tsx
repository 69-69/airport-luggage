'use client';

import * as React from 'react';
import {
    Alert,
    Typography,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {DataRow} from "@/types/dataRow";
import {AutocompleteDropdown} from "@/components/dropdown";
import {
    clearErrorAndSetString,
    clearOutcomeError, clearOutcomeErrorString,
    manualGates,
    manualTerminals,
    OutcomeProps,
    toTitleCase
} from "@/utils/util";
import {setOutcomeHelper} from "@/utils/validators";

interface ChangeGateDialogProps {
    open: boolean;
    onClose: () => void;
    oldGate: string;
    selectedFlight: string;
    oldDestination: string;
    onChangeGate: (row: DataRow) => void;
    outcome?: OutcomeProps; // the *current value* of the outcome
    setOutcome: React.Dispatch<React.SetStateAction<OutcomeProps | undefined>>;
}

const ChangeGateDialog = ({
                              open,
                              onClose,
                              outcome,
                              setOutcome,
                              oldGate,
                              selectedFlight,
                              oldDestination,
                              onChangeGate,
                          }: ChangeGateDialogProps) => {

    const [terminal, setTerminal] = React.useState('');
    const [newGate, setNewGate] = React.useState('');

    const handleSubmit = () => {

        if (terminal.length < 2) {
            return setOutcomeHelper('error', 'New Terminal is required', setOutcome);
        }
        if (newGate.length < 2) {
            return setOutcomeHelper('error', 'New Gate is required', setOutcome);
        }
        onChangeGate({
            terminal: terminal,
            gate: newGate,
        });

        // setOutcome(undefined);
        // onClose();
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Change Gate Information"
            onConfirm={handleSubmit}
            cancelLabel={'Cancel'}
            confirmDisabled={!terminal || !newGate}
            confirmLabel={'Save Changes'}
            content={
                <>
                    <Typography>
                        <b>Flight:</b> {selectedFlight.toUpperCase()}<br/>
                        <b>Current Gate:</b> {oldGate.toUpperCase()}<br/>
                        <b>Destination:</b> {toTitleCase(oldDestination)}
                    </Typography>
                    <AutocompleteDropdown
                        label="New Terminal" data={[' ', ...manualTerminals]}
                        value={terminal}
                        onChange={clearOutcomeErrorString(setTerminal, setOutcome)}
                    />
                    <AutocompleteDropdown
                        label="New Gate" data={[' ', ...manualGates]}
                        value={newGate}
                        onChange={clearOutcomeErrorString(setNewGate, setOutcome)}
                    />
                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>{outcome.message}</Alert>
                    )}
                </>
            }/>
    );
}

export default ChangeGateDialog;

