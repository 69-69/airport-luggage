'use client';

import * as React from 'react';
import {
    Alert,
    TextField,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {
    clearOutcomeError, getAirlineByCode,
    isNumeric,
    OutcomeProps, toTitleCase
} from "@/utils/util";
import {setOutcomeHelper, stripAlphabets} from "@/utils/validators";
import {Passenger, PassengerResult} from "@/types/models";
import {verifyPassenger} from "@/actions/endpoints";
import {passengerService} from "@/actions/services/passengerService";

interface VerifyPassengerDialogProps {
    open: boolean;
    onClose: () => void;
    ticket: string | null;
    idNo: string | null;
    fullName: string | null;
    onProceedToCheckIn: (ticket: string, flight: string) => void;
    // onVerifyPassenger: (row: DataRow) => void;
}

const _airlineName = (flight: string) => getAirlineByCode(stripAlphabets(flight));

const VerifyPassengerDialog = ({
                                   open,
                                   onClose,
                                   ticket,
                                   idNo,
                                   fullName,
                                   onProceedToCheckIn,
                                   // onVerifyPassenger,
                               }: VerifyPassengerDialogProps) => {

    const [idNumber, setIdNumber] = React.useState('');
    const [ticketNumber, setTicketNumber] = React.useState('');
    const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [passenger, setPassenger] = React.useState<Passenger>();
    // const [error, setError] = React.useState<string | null>(null);


    const handleVerification = async () => {

        if (!isNumeric(ticketNumber)) {
            return setOutcomeHelper('error', 'Enter a valid ticket number', setOutcome);
        }
        if (ticketNumber.length > 10) {
            return setOutcomeHelper('error', 'Ticket number must be at most 10 digits long.', setOutcome);
        }

        if (!idNumber || !isNumeric(idNumber)) {
            return setOutcomeHelper('error', 'Enter a valid ID number', setOutcome);
        }
        if (idNumber.length !== 6) {
            return setOutcomeHelper('error', 'ID must be at most 6 digits long', setOutcome);
        }

        // setOutcomeHelper('success', 'Passenger verified successfully!', setOutcome); // If everything is valid, set success message

        // Verify passenger
        const result: PassengerResult = verifyPassenger({
            ticketNumber: ticketNumber,
            idNumber: idNumber,
        });

        if (result.success) {
            passengerService.checkIn(ticketNumber); // Update Passenger Status as "CHECKED_IN"
            await passengerService.checkInRemote(ticketNumber); // Update Passenger Status as "CHECKED_IN"
            setPassenger(result.passenger);
            // setOutcome({status: 'success', message: 'Passenger verified. You may proceed with baggage check-in.',});
            setOutcomeHelper('success', 'Passenger verified. You may proceed with baggage check-in.', setOutcome);
            console.log("Passenger verified!");
        } else {
            setOutcome({status: 'error', message: result.error ?? ''});
            console.log(result.error);
        }

        // Reset form immediately
        // resetForm();
    };

    React.useEffect(() => {
        if (open) {
            setIdNumber(idNo ?? '');
            setTicketNumber(ticket ?? '');
            setPassenger(undefined);
            setOutcome(undefined);
        }
    }, [open, ticket, idNo]);

    /*const resetForm = () => {
        // Reset form when dialog is closed
        setTicketNumber('');
        setIdNumber('');
        // Clear the outcome
        setOutcome(undefined);

        // Call the onClose function passed from the parent
        // onClose();
    };*/

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Passenger Verification"
            cancelLabel={'Cancel'}
            optionLabel="Verify"
            optDisabled={!ticketNumber || !idNumber}
            onOption={handleVerification}
            confirmLabel='Proceed to Check-in'
            confirmDisabled={!passenger}
            onConfirm={() => {
                if (passenger) {
                    onProceedToCheckIn(ticketNumber, passenger?.flightNumber ?? '');
                }
            }}
            content={
                <>
                    {passenger ? (
                        <Alert sx={{mt: 2}}>
                            <b>Name:</b> {toTitleCase(passenger?.firstName + " " + passenger?.lastName)}<br/>
                            <b>Ticket:</b> {passenger?.ticketNumber}<br/>
                            <b>Airline:</b> {_airlineName(passenger?.flightNumber ?? '')}<br/>
                            <b>Flight:</b> {passenger?.flightNumber.toUpperCase()}<br/>
                        </Alert>
                    ) : (
                        <>
                            <Alert severity="warning" sx={{mt: 2}}>
                                Passenger must be verified before check-in.
                                Click on verify to proceed!
                            </Alert>
                            <span><b>Verify:</b> {fullName}</span>
                        </>
                    )}
                    <TextField
                        label="Ticket Number"
                        type="text"
                        fullWidth
                        size="small"
                        value={ticketNumber}
                        disabled={!!ticket || !!ticketNumber}
                        onChange={clearOutcomeError(setTicketNumber, setOutcome)}
                        slotProps={{
                            input: {
                                id: 'ticket-number', autoFocus: true,
                                inputProps: {maxLength: 10, minLength: 10,}
                            },
                        }}
                        helperText="Ticket number can be up to 10 digits"
                    />
                    <TextField
                        label="ID Number"
                        type="text"
                        fullWidth
                        size="small"
                        value={idNumber}
                        disabled={!!idNo || !!idNumber}
                        onChange={clearOutcomeError(setIdNumber, setOutcome)}
                        slotProps={{
                            input: {
                                id: 'id-number', autoFocus: true,
                                inputProps: {maxLength: 6, minLength: 6,}
                            },
                        }}
                        helperText="Passport or Driver License Number (Max 6 digits)"
                    />
                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>{outcome.message}</Alert>
                    )}
                </>
            }/>
    )
        ;
}

export default VerifyPassengerDialog;

