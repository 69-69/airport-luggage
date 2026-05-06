'use client';

import * as React from 'react';
import {
    Alert,
    TextField,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {DataRow} from "@/types/dataRow";
import {AutocompleteDropdown} from "@/components/dropdown";
import {clearOutcomeError, clearOutcomeErrorString, OutcomeProps} from "@/utils/util";
import {setOutcomeHelper} from "@/utils/validators";
import {RoleEnum, StaffRoles} from "@/types/userRole";
import {Flight, UserRole} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {useEffect} from "react";
import {useAuth} from "@/actions/authContext";

interface PostDialogProps {
    // role?: UserRole;
    open: boolean;
    msg?: string;
    isSecurityViolation?: boolean;
    onClose: () => void;
    outcome?: OutcomeProps; // the *current value* of the outcome
    setOutcome: React.Dispatch<React.SetStateAction<OutcomeProps | undefined>>; // the *setter* for updating it
    onPost: (row: DataRow) => void;
}

const MessageDialog = ({
                           // role,
                           open,
                           isSecurityViolation,
                           onClose,
                           onPost,
                           outcome,
                           msg,
                           setOutcome,
                       }: PostDialogProps) => {
    const {user} = useAuth();
    // Checking if current User is an ADMIN
    const isAdmin = user?.role == (RoleEnum.ADMIN as UserRole);


    const [message, setMessage] = React.useState('');
    const [to, setTo] = React.useState('');
    const [airlineName, setAirlineName] = React.useState('');
    const [airlines, setAirlines] = React.useState<Flight[]>([]);
    // const [error, setOutcome] = React.useState<string | null>(null);

    // Get All Airlines added to Flight table
    const fetchFlights = () => {
        try {
            const res: Flight[] = flightService.getAll();
            setAirlines(res);
        } catch (e) {
            console.error("Error fetching airlines:", e);
        }
    };

    useEffect(() => {
        if (open) {
            fetchFlights();
            setMessage(msg ?? '');
        }
    }, [open]); // re-run whenever the dialog is opened


    const handleChange = () => {
        if (message.length < 5) {
            return setOutcomeHelper('error', 'Your message is too short.', setOutcome);
        }
        if (isAdmin && to == '') {
            return setOutcomeHelper('error', 'Choose who this message is for.', setOutcome);
        }

        // If everything is valid, set success message
        setOutcomeHelper('success', 'Message sent successfully!', setOutcome);

        const who = isAdmin || isSecurityViolation;
        onPost({
            message,
            // Admin specifies 'Recipient'; but other staffs messages are auto-assign
            to: who ? to : user?.role,
            fromRole: user?.role,
            // Admin specifies 'airlineName'; but other staffs messages are auto-assign
            airline: who ? airlineName : user?.airline,
            fromUsername: user?.username,
        });

        // Reset form immediately
        resetForm();
    };

    const resetForm = () => {
        setMessage('');
        setTo('');
        // Clear the outcome
        setOutcome(undefined);

        // Call the onClose function passed from the parent
        // onClose();
    }

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title={msg ? "Confirm Action" : "Post Message"}
            confirmDisabled={outcome?.status == 'error'}
            onConfirm={handleChange}
            cancelLabel={'Cancel'}
            confirmLabel={msg ? 'Confirm' : 'Send Message'}
            content={
                <>
                    {!msg && (<TextField
                        label="Message..."
                        type="text"
                        multiline
                        size="small"
                        rows={3}
                        value={message}
                        onChange={clearOutcomeError(setMessage, setOutcome)}
                        slotProps={{
                            input: {
                                id: 'message',
                                autoFocus: true,
                                inputProps: {maxLength: 200, minLength: 5}
                            },
                        }}
                    />)}
                    {(isAdmin || isSecurityViolation) && (
                        <>
                            <AutocompleteDropdown
                                label="Department"
                                data={isSecurityViolation ? [StaffRoles[0]] : StaffRoles}
                                helperText="Recipient department"
                                value={to}
                                disabled={isSecurityViolation && to.length > 0}
                                onChange={clearOutcomeErrorString(setTo, setOutcome)}
                            />
                            {to && (
                                <AutocompleteDropdown
                                    label="Airline"
                                    helperText="Airline associated with this message"
                                    data={
                                        (Array.isArray(airlines) ? airlines : []).map((a) => (a.airlineName))
                                    }
                                    value={airlineName}
                                    onChange={clearOutcomeErrorString(setAirlineName, setOutcome)}/>
                            )}
                        </>
                    )}
                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>{outcome.message}</Alert>
                    )}
                </>
            }/>
    );
}

export default MessageDialog;

