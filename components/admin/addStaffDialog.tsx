'use client';
import * as React from 'react';
import {
    Alert,
    TextField,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {DataRow} from "@/types/dataRow";
import {AutocompleteDropdown} from "@/components/dropdown";
import {Grid} from "@mui/system";
import {
    clearOutcomeError,
    clearOutcomeErrorString,
    emailRegex,
    isNumeric, manualAirlines,
    namePattern, OutcomeProps
} from "@/utils/util";
import {setOutcomeHelper} from "@/utils/validators";
import {StaffRoles} from "@/types/userRole";
import {Flight} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {useEffect} from "react";

interface AddStaffDialogProps {
    open: boolean;
    onClose: () => void;
    outcome?: OutcomeProps; // the *current value* of the outcome
    setOutcome: React.Dispatch<React.SetStateAction<OutcomeProps | undefined>>; // the *setter* for updating it
    onAddStaff: (row: DataRow) => void;
}

const AddStaffDialog = ({
                            open,
                            onClose,
                            outcome,
                            setOutcome,
                            onAddStaff,
                        }: AddStaffDialogProps) => {

    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [role, setRole] = React.useState('');
    const [airline, setAirline] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [airlines, setAirlines] = React.useState<string[]>([]);
    // const [error, setOutcome] = React.useState<string | null>(null);

    // Fetch Airlines
    const getAirlines = () => {
        try {
            const res: Flight[] = flightService.getAll();
            const all: string[] = res
                .map((a) => a.airlineName)
                .filter((name): name is string => !!name?.trim());

            setAirlines([...all, ...manualAirlines]);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    useEffect(() => {
        if (open) {
            getAirlines();
        }
    }, [open]); // re-run whenever the dialog is opened

    const handleSubmit = () => {
        // Check for validation errors
        if (!namePattern.test(firstName)) {
            return setOutcomeHelper('error', 'Enter a valid first name', setOutcome);
        }
        if (!namePattern.test(lastName)) {
            return setOutcomeHelper('error', 'Enter a valid last name', setOutcome);
        }
        if (!emailRegex.test(email)) {
            return setOutcomeHelper('error', 'Enter valid email address', setOutcome);
        }
        if (phone.length < 10 || !isNumeric(phone)) {
            return setOutcomeHelper('error', 'Enter valid phone number', setOutcome);
        }
        if (!role.trim() || role === ' ') {
            return setOutcomeHelper('error', 'Role is required', setOutcome);
        }
        if (!airline.trim() || airline === ' ') {
            return setOutcomeHelper('error', 'Airline is required', setOutcome);
        }

        setOutcomeHelper('success', 'Staff added successfully!', setOutcome); // If everything is valid, set success message

        // Continue with adding the staff
        onAddStaff({
            firstName: firstName,
            lastName: lastName,
            role: role,
            airline: airline,
            email: email,
            phone: phone,
        });

        if(outcome?.status !== 'error' || outcome.status !== undefined) {
            // Reset form immediately
            resetForm();
        }
    };

    const resetForm = () => {
        // Reset form when dialog is closed
        setFirstName('');
        setLastName('');
        setRole('');
        setAirline('');
        setEmail('');
        setPhone('');
        setRole('');
        setAirline('');

        // Call the onClose function passed from the parent
        // onClose();
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Add Staff"
            onConfirm={handleSubmit}
            cancelLabel={'Cancel'}
            confirmDisabled={!firstName || !lastName || !email || !phone || !role || !airline}
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
                        label="Email"
                        type="email"
                        fullWidth
                        size="small"
                        value={email}
                        onChange={clearOutcomeError(setEmail, setOutcome)}
                        slotProps={{input: {id: 'email'}}}
                    />
                    <TextField
                        label="Phone"
                        type="phone"
                        fullWidth
                        size="small"
                        value={phone}
                        slotProps={{
                            input: {
                                id: 'phone', inputProps: {maxLength: 10}
                            }
                        }}
                        onChange={clearOutcomeError(setPhone, setOutcome)}
                    />
                    <AutocompleteDropdown
                        label="Role" data={[' ', ...StaffRoles]}
                        value={role}
                        onChange={clearOutcomeErrorString(setRole, setOutcome)}
                    />
                    <AutocompleteDropdown
                        label="Airline"
                        data={airlines}
                        value={airline}
                        helperText="Type to search airlines, or enter one manually"
                        onChange={clearOutcomeErrorString(setAirline, setOutcome)}
                    />
                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>{outcome.message}</Alert>
                    )}
                </>
            }/>
    );
}

export default AddStaffDialog;

