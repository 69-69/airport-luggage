'use client';

import * as React from 'react';
import {
    Alert,
    TextField,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {AutocompleteDropdown} from "@/components/dropdown";
import {Grid} from "@mui/system";
import {
    clearOutcomeError,
    clearOutcomeErrorString,
    manualAirlines,
    manualGates,
    manualTerminals,
    OutcomeProps
} from "@/utils/util";
import {ensureAbbreviation, setOutcomeHelper, splitFlightNumber} from "@/utils/validators";
import {SendResult} from "@/types/models";
import {addFlight} from "@/actions/endpoints";

interface AddFlightDialogProps {
    open: boolean;
    onClose: () => void;
    refreshFlights?: () => void;
    // onAddFlight: (row: DataRow) => void;
}

const AddFlightDialog = ({
                             open,
                             onClose,
                             refreshFlights
                         }: AddFlightDialogProps) => {

    const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [airline, setAirline] = React.useState('');
    const [destination, setDestination] = React.useState('');
    const [flightNumber, setFlightNumber] = React.useState('');
    const [terminal, setTerminal] = React.useState('');
    const [gate, setGate] = React.useState('');
    // const [flightId, setFlightId] = React.useState('');
    const [departureTime, setDepartureTime] = React.useState('');

    // const [error, setOutcome] = React.useState<string | null>(null);

    const handleChange = async () => {
        if (airline.length < 3) {
            return setOutcomeHelper('error', 'Enter a valid airline name', setOutcome);
        }
        /*if (!flightId || !isNumeric(flightId)) {
            return setOutcomeHelper('error', 'Enter a valid flight ID', setOutcome);
        }
        if (flightId.length < 4) {
            return setOutcomeHelper('error', 'Flight ID must be at least 4 characters long.', setOutcome);
        }*/
        if (!flightNumber) {
            return setOutcomeHelper('error', 'Flight number is required', setOutcome);
        }
        if (flightNumber.length !== 6) {
            // two letters of Airline code followed by a 4-digit flight number;
            // e.g., DL0245
            return setOutcomeHelper('error', 'Flight number must be exactly 6 characters long.', setOutcome);
        }
        // Letters at start + exactly 4 digits
        const flightRegex = /^[A-Za-z]+\d{4}$/;
        if (!flightRegex.test(flightNumber)) {
            return setOutcomeHelper('error',
                'Flight number must be 2-letter airline abbreviation plus 4-digit flight ID (e.g., DL7245)',
                setOutcome
            );
        }
        if (terminal.length < 2) {
            return setOutcomeHelper('error', 'Terminal is required', setOutcome);
        }
        if (gate.length < 2) {
            return setOutcomeHelper('error', 'Gate is required', setOutcome);
        }
        if (!departureTime) {
            return setOutcomeHelper('error', 'Departure time is required', setOutcome);
        }

        setOutcomeHelper('success', 'Flight added successfully!', setOutcome); // If everything is valid, set success message

        const {flightId} = splitFlightNumber(flightNumber);
        const data = {
            airlineName: ensureAbbreviation(airline), // E.g: → "BA - British Airways"
            destination: destination,
            flightId: flightId,
            flightNumber: flightNumber,
            gate: gate,
            terminal: terminal,
            departureTime: new Date(departureTime).toISOString(),
        };

        const result: SendResult = await addFlight(data);
        // const res = await flightService.addRemote(data);
        // console.log('steve', res);

        if (result.success) {
            setOutcome({status: 'success', message: 'Flight added successfully',});
            if (refreshFlights) {
                refreshFlights();
            }

            // Reset form immediately
            resetForm();
        } else {
            setOutcome({status: 'error', message: result.error ?? ''});
            console.log('Flight', result.error);
        }
    };

    const resetForm = () => {
        setAirline('');
        setDestination('');
        setFlightNumber('');
        // setFlightId('');
        setGate('');
        setTerminal('');
        setDepartureTime('');

        // Clear the outcome
        // setOutcome(undefined);

        // Call the onClose function passed from the parent
        // onClose();
    }

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Add Flight"
            onConfirm={handleChange}
            cancelLabel={'Cancel'}
            confirmDisabled={
                !airline ||
                !flightNumber ||
                !gate ||
                !terminal ||
                !departureTime
            }
            confirmLabel={'Add'}
            content={
                <>
                    <AutocompleteDropdown
                        label="Airline"
                        data={[' ', ...manualAirlines]}
                        value={airline}
                        helperText="Type to search airlines, or enter one manually"
                        onChange={clearOutcomeErrorString(setAirline, setOutcome)}
                    />
                    <TextField
                        label="Destination"
                        type="text"
                        fullWidth
                        size="small"
                        value={destination}
                        onChange={clearOutcomeError(setDestination, setOutcome)}
                        slotProps={{
                            input: {id: 'destination'},
                        }}
                    />

                    <Grid container spacing={2}>
                        {/*<Grid size={{xs: 12, md: 6}}>
                            <TextField
                                label="Flight ID"
                                type="text"
                                fullWidth
                                size="small"
                                value={flightId}
                                helperText="Flight Id (e.g: 1234)"
                                // disabled={flightId.length>0}
                                onChange={clearOutcomeError(setFlightId, setOutcome)}
                                slotProps={{
                                    input: {
                                        id: 'flight-id',
                                        // startAdornment: inputAdornment,
                                    },
                                }}
                            />
                        </Grid>*/}
                        <Grid size={{xs: 12, md: 12}}>
                            <TextField
                                label="Flight Number"
                                type="text"
                                fullWidth
                                size="small"
                                value={flightNumber}
                                helperText="Maximum up to 6 characters (e.g: AA1234)"
                                // disabled={flightNumber.length ==6}
                                onChange={clearOutcomeError(setFlightNumber, setOutcome)}
                                slotProps={{
                                    input: {
                                        id: 'flight-number',
                                        // startAdornment: inputAdornment,
                                        inputProps: {maxLength: 6, minLength: 6},
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                    <AutocompleteDropdown
                        label="Terminal" data={[' ', ...manualTerminals]}
                        value={terminal}
                        onChange={clearOutcomeErrorString(setTerminal, setOutcome)}
                    />
                    <AutocompleteDropdown
                        label="Gate Number" data={[' ', ...manualGates]}
                        value={gate}
                        onChange={clearOutcomeErrorString(setGate, setOutcome)}
                    />
                    <TextField
                        label="Departure Time"
                        type="datetime-local"
                        fullWidth
                        size="small"
                        value={departureTime}
                        onChange={(e) => {
                            setDepartureTime(e.target.value);
                            if (outcome?.status === 'error') {
                                setOutcome(undefined);
                            }
                        }}
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                    />
                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>{outcome.message}</Alert>
                    )}
                    {/*<TextField
                        label="Airline Name"
                        type="text"
                        fullWidth
                        size="small"
                        value={airline}
                        // onChange={onChangedAirlineName}
                        onChange={clearOutcomeError(setAirlineName, setOutcome)}
                        slotProps={{input: {id: 'airline-name'},}}
                    />*/}
                </>
            }/>
    );
}

export default AddFlightDialog;

/*
    useEffect(() => {
        if (open) {
            const ticketNo = flightIdGenerator();
            setFlightId(ticketNo.toString());

            if (debouncedAirlineName.length > 5) {
                const airlineAbbreviation = getAirlineAbbreviation(airlineName);
                setFlightNumber(airlineAbbreviation+ticketNo);
            }
        }
    }, [open, debouncedAirlineName]);

let inputAdornment = <><InputAdornment
        position="start"
        sx={{bgcolor: 'rgba(109,184,236,0.8)', py: 0.1, px: 1, borderRadius: 1}}
    >
        <Typography color="error">Auto</Typography>
    </InputAdornment></>;

const [debouncedAirlineName, setDebouncedAirlineName] = React.useState(airlineName);
    const [typingTimeout, setTypingTimeout] = React.useState<NodeJS.Timeout | null>(null);

    // Debouncing: to wait for the user to finish typing before triggering the effect
    const onChangedAirlineName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAirlineName(e.target.value);

        // Clear error if any when the user starts typing
        if (outcome?.status === 'error') {
            setOutcome(undefined);
        }

        // Clear the previous timeout if any
        if(typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Set a new timeout to update debounced value after 500ms of no typing
        const timeout = setTimeout(() => {
            setDebouncedAirlineName(e.target.value);
        }, 500); // 500ms delay before updating
        setTypingTimeout(timeout);
    };
*/