'use client';

import * as React from 'react';
import {Alert, TextField,} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {clearOutcomeError, getAirlineByCode, isNumeric, OutcomeProps, toTitleCase} from "@/utils/util";
import {setOutcomeHelper, stripAlphabets} from "@/utils/validators";
import {Passenger} from "@/types/models";

interface BoardDialogProps {
    open: boolean;
    ticket: string | null;
    fullName: string | null;
    onClose: () => void;
    showConfirmation: () => void;
    passenger: Passenger | undefined;
    // onBoard: (ticketNumber: string) => void;
    outcome?: OutcomeProps; // the *current value* of the outcome
    setOutcome: React.Dispatch<React.SetStateAction<OutcomeProps | undefined>>;
}

const _airlineName = (flight: string) => getAirlineByCode(stripAlphabets(flight));

const BoardDialog = ({
                         open,
                         onClose,
                         ticket,
                         fullName,
                         outcome,
                         setOutcome,
                         passenger,
                         showConfirmation,
                     }: BoardDialogProps) => {
    const [ticketNumber, setTicketNumber] = React.useState('');

    React.useEffect(() => {
        if (open && ticket !== null) {
            setTicketNumber(ticket ?? '');
        }
    }, [open, ticket]);

    const handleSubmit = () => {
        if (ticketNumber.length < 10) {
            return setOutcomeHelper('error', 'Enter a valid ticket number', setOutcome);
        }
        showConfirmation();
        // setOutcomeHelper('success', 'Passenger boarded!', setOutcome); // If everything is valid, set success message
        // onBoard(ticketNumber);
        // onClose();
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Board Passenger"
            onConfirm={handleSubmit}
            cancelLabel='Cancel'
            confirmDisabled={!ticketNumber || !isNumeric(ticketNumber)}
            confirmLabel='Board Passenger'
            content={
                <>
                    <span><b>About to Onboard</b>: {fullName} </span> with ticket {ticketNumber}

                    {!ticket && (<TextField
                        label="Ticket Number"
                        type="text"
                        fullWidth
                        size="small"
                        value={ticketNumber}
                        helperText="Ticket number can be up to 10 digits"
                        disabled={!!ticket}
                        sx={{display: 'none'}}
                        onChange={clearOutcomeError(setTicketNumber, setOutcome)}
                        slotProps={{
                            input: {
                                id: 'ticket-number', autoFocus: true,
                                inputProps: {minLength: 10, maxLength: 10}
                            },
                        }}
                    />)}
                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>
                            {outcome.message}

                            {passenger && (
                                <p>
                                    <b>Name:</b> {toTitleCase(`${passenger?.firstName ?? ''} ${passenger?.lastName ?? ''}`)}<br/>
                                    <b>Ticket:</b> {passenger?.ticketNumber ?? 'N/A'}<br/>
                                    <b>Airline:</b> {_airlineName(passenger?.flightNumber ?? '')}<br/>
                                    <b>Flight:</b> {passenger?.flightNumber?.toUpperCase() ?? 'N/A'}
                                </p>
                            )}
                        </Alert>
                    )}
                </>
            }/>
    );
}

export default BoardDialog;

