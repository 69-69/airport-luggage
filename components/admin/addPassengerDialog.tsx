'use client';
import * as React from 'react';
import {
    Alert,
    TextField,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {AutocompleteDropdown} from "@/components/dropdown";
import {Grid} from "@mui/system";
import {clearOutcomeError, clearOutcomeErrorString, isNumeric, namePattern, OutcomeProps} from "@/utils/util";
import {setOutcomeHelper} from "@/utils/validators";
import {useEffect} from "react";
import {Flight, SendResult} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {addPassenger} from "@/actions/endpoints";

interface AddPassengerDialogProps {
    open: boolean;
    onClose: () => void;
    refreshPassengers?: () => void;
    // onAddPassenger: (row: DataRow) => void;
    // outcome?: OutcomeProps; // the "current value" of the outcome
    // setOutcome: React.Dispatch<React.SetStateAction<OutcomeProps | undefined>>; // the "setter" for updating it
}

const AddPassengerDialog = ({
                                open,
                                onClose,
                                refreshPassengers,
                                // onAddPassenger,
                            }: AddPassengerDialogProps) => {

    const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [flightNumber, setFlightNumber] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [ticketNumber, setTicketNumber] = React.useState('');
    const [idNumber, setIdNumber] = React.useState('');
    const [flights, setFlights] = React.useState<Flight[]>([]);
    // const [error, setOutcome] = React.useState<string | null>(null);

    // Fetch Flight list
    const fetchFlights = () => {
        try {
            const res: Flight[] = flightService.getAll();
            setFlights(res);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    useEffect(() => {
        if (open) {
            fetchFlights();
            setOutcome(undefined);
        }
    }, [open]); // re-run whenever the dialog is opened

    const handleSubmit = async () => {

        if (!namePattern.test(firstName)) {
            return setOutcomeHelper('error', 'Enter a valid first name', setOutcome);
        }
        if (!namePattern.test(lastName)) {
            return setOutcomeHelper('error', 'Enter a valid last name', setOutcome);
        }
        /*if (!flightNumber) {
            return setOutcomeHelper('error', 'Flight Number is required', setOutcome);
        }*/
        if (!idNumber || !isNumeric(idNumber)) {
            return setOutcomeHelper('error', 'Enter a valid ID number', setOutcome);
        }
        if (idNumber.length !== 6) {
            return setOutcomeHelper('error', 'ID number must be at most 6 digits long', setOutcome);
        }
        if (!isNumeric(ticketNumber)) {
            return setOutcomeHelper('error', 'Enter a valid ticket number', setOutcome);
        }

        if (ticketNumber.length > 10) {
            return setOutcomeHelper('error', 'Ticket number must be at most 10 digits long.', setOutcome);
        }

        setOutcomeHelper('success', 'Passenger added successfully!', setOutcome); // If everything is valid, set success message

        const result: SendResult = await addPassenger({
            firstName: firstName,
            lastName: lastName,
            idNumber: idNumber,
            ticketNumber: ticketNumber,
            flightNumber: flightNumber || '',
        });

        if (result.success) {
            // Add ticket to Flight
            if (flightNumber) {
                flightService.update({flightNumber: flightNumber, ticket: ticketNumber});
            }

            if (refreshPassengers) {
                refreshPassengers();
            }

            setOutcome({status: 'success', message: 'Passenger added successfully',});
            console.log("Passenger added!");

            // Reset form immediately
            resetForm();
        } else {
            setOutcome({status: 'error', message: result.error ?? ''});
            console.log(result.error);
        }
    };

    const resetForm = () => {
        // Reset form when dialog is closed
        setFirstName('');
        setLastName('');
        setFlightNumber('');
        setTicketNumber('');
        setIdNumber('');
        // Clear the outcome
        // setOutcome(undefined);

        // Call the onClose function passed from the parent
        // onClose();
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Add Passenger"
            onConfirm={handleSubmit}
            cancelLabel={'Cancel'}
            confirmDisabled={!firstName || !lastName || !idNumber || !ticketNumber}
            confirmLabel={'Add'}
            content={
                <>
                    <Grid container spacing={2}>
                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                label="First Name"
                                type="text"
                                fullWidth
                                size="small"
                                value={firstName}
                                onChange={clearOutcomeError(setFirstName, setOutcome)}
                                slotProps={{input: {id: 'first-name'},}}
                            />
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                            <TextField
                                label="Last Name"
                                type="text"
                                fullWidth
                                size="small"
                                value={lastName}
                                onChange={clearOutcomeError(setLastName, setOutcome)}
                                slotProps={{input: {id: 'last-name'}}}
                            />
                        </Grid>
                    </Grid>
                    <TextField
                        label="ID Number"
                        type="text"
                        fullWidth
                        size="small"
                        value={idNumber}
                        onChange={clearOutcomeError(setIdNumber, setOutcome)}
                        slotProps={{
                            input: {id: 'id-number', inputProps: {minLength: 6, maxLength: 6}}
                        }}
                        helperText="Passport or Driver License Number (Max 6 digits)"
                    />
                    <TextField
                        label="Ticket Number"
                        type="text"
                        fullWidth
                        size="small"
                        value={ticketNumber}
                        helperText="Ticket number can be up to 10 digits"
                        // disabled={ticketNumber.length == 10}
                        onChange={clearOutcomeError(setTicketNumber, setOutcome)}
                        slotProps={{
                            input: {
                                id: 'ticket-number',
                                inputProps: {maxLength: 10, minLength: 10},
                                /*startAdornment: (
                                    <InputAdornment
                                        position="start"
                                        sx={{bgcolor: 'rgba(109,184,236,0.8)', py: 0.1, px: 1, borderRadius: 1}}
                                    >
                                        <Typography color="error">Auto</Typography>
                                    </InputAdornment>
                                ),*/
                            },
                        }}
                    />
                    <AutocompleteDropdown
                        label="Flight"
                        helperText="Flight can be assign now or after"
                        data={
                            (Array.isArray(flights) ? flights : []).map((f) => (f.flightNumber))
                        }
                        value={flightNumber}
                        onChange={clearOutcomeErrorString(setFlightNumber, setOutcome)}
                    />
                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>{outcome.message}</Alert>
                    )}
                </>
            }/>
    );
}

export default AddPassengerDialog;

/*
    useEffect(() => {
        if (open) {
            const ticketNo = ticketGenerator();
            setTicketNumber(ticketNo.toString());
            fetchFlights();
        }
    }, [open]); // re-run whenever the dialog is opened
*/