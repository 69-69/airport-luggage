'use client';
import * as React from 'react';
import {
    Alert,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {AutocompleteDropdown} from "@/components/dropdown";
import {clearOutcomeErrorString, OutcomeProps} from "@/utils/util";
import {setOutcomeHelper} from "@/utils/validators";
import {useEffect} from "react";
import {Flight} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {passengerService} from "@/actions/services/passengerService";

interface AssignFlightDialogProps {
    open: boolean;
    onClose: () => void;
    ticketNumber: string;
    refreshPassengers?: () => void;
}

const AssignFlightToDialog = ({
                                open,
                                onClose,
                                  ticketNumber,
                                refreshPassengers,
                            }: AssignFlightDialogProps) => {

    const [flights, setFlights] = React.useState<Flight[]>([]);
    const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [flightNumber, setFlightNumber] = React.useState('');

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
        if (!flightNumber) {
            return setOutcomeHelper('error', 'Flight Number is required', setOutcome);
        }

        if (!ticketNumber) {
            return setOutcomeHelper('error', 'Ticket number is required.', setOutcome);
        }

        try {
            passengerService.changePassengerFlight(ticketNumber, flightNumber);

            /*passengerService.updateFlight(ticketNumber, flightNumber);
            flightService.assignFlight({
                flightNumber,
                ticket: ticketNumber
            });*/

            setOutcomeHelper(
                'success',
                `Passenger added to Flight ${flightNumber.toUpperCase()}!`,
                setOutcome
            );

            if (refreshPassengers) {
                refreshPassengers();
            }

            resetForm();

        } catch (e) {
                setOutcomeHelper(
                'error',
                    e instanceof Error ? e.message : `Failed to add passenger to Flight ${flightNumber.toUpperCase()}.`,
                setOutcome
            );
        }
    };

    const resetForm = () => {
        setFlightNumber('');
        // Call the onClose function passed from the parent
        // onClose();
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Add Passenger to Flight"
            onConfirm={handleSubmit}
            cancelLabel={'Cancel'}
            confirmDisabled={!flightNumber || !ticketNumber}
            confirmLabel={'Add'}
            content={
                <>
                    <AutocompleteDropdown
                        label="Flight"
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

export default AssignFlightToDialog;
