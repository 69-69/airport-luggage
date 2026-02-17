'use client';

import * as React from 'react';
import {
    Typography,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {AutocompleteDropdown} from "@/components/dropdown";
import {useSearchParams} from "next/navigation";
import {dashboardRedirectPath} from "@/types/userRole";
import {useAuth} from "@/actions/authContext";
import {manualGates} from "@/utils/util";

interface GatePrefDialogProps {
    open: boolean;
    onClose: () => void;
}

const GatePreferenceDialog = ({
                                  open,
                                  onClose,
                              }: GatePrefDialogProps) => {
    const {user, login, logout} = useAuth();

    const [newGate, setNewGate] = React.useState('');
    const [error, setError] = React.useState('');
    const searchParams = useSearchParams();

    const handleAssign = () => {
        if (newGate == '') {
            setError('New gate is required');
            return;
        }

        setError('');

        // Update Auth Context
        if (user) {
            const updatedUser = {
                ...user,
                workMode: newGate, // The Selected Gate Number
            }

            // persist updated user
            const redirectPath = searchParams.get('redirect') || dashboardRedirectPath({role: user.role});
            login(updatedUser, true, redirectPath);

            onClose(); // close dialog
        }
    };

    const handleLogout = () => {
        logout(); // logout
        onClose(); // close dialog
    };

    return (
        <UiDialog
            open={open}
            onCancel={handleLogout}
            title="Gate Preference"
            cancelLabel={'Logout'}
            onConfirm={handleAssign}
            confirmLabel={'Assign'}
            content={
                <>
                    <Typography id="gate-preference" sx={{alignItems: 'center', gap: 1}}>
                        <b>Welcome</b>! Select the gate you want to work at for this shift
                    </Typography>
                    <AutocompleteDropdown
                        label="Gate Option" data={manualGates}
                        value={newGate}
                        onChange={(e) => setNewGate(e)}
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

export default GatePreferenceDialog;

