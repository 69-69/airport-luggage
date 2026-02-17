'use client';

import * as React from 'react';
import {
    Typography,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {useSearchParams} from 'next/navigation';
import {dashboardRedirectPath, RoleEnum, securityClearance} from "@/types/userRole";
import {useAuth} from "@/actions/authContext";

interface WorkPrefDialogProps {
    open: boolean;
    onClose: () => void;
    onGateSelected: (isGate: boolean) => void;
}

const WorkPreferenceDialog = ({
                                  open,
                                  onClose,
                                  onGateSelected,
                              }: WorkPrefDialogProps) => {

    const searchParams = useSearchParams();
    const {user, login, logout} = useAuth();

    const handleClearance = () => {
        if (user) {
            const updatedUser = {
                ...user,
                workMode: securityClearance // Security Clearance is Selected
            }

            // persist updated user
            const redirectPath = searchParams.get('redirect') || dashboardRedirectPath({role: user.role});
            login(updatedUser, true, redirectPath);

            onClose(); // close dialog
        }
    };

    const handleGate = () => {
        onGateSelected(true);
    }

    const handleLogout = () => {
        logout(); // logout
        onClose(); // close dialog
    };

    return (
        <UiDialog
            open={open}
            title="Work Preference"
            cancelLabel='Logout'
            onCancel={handleLogout}
            confirmLabel='Monitor Security Clearance'
            onConfirm={handleClearance}
            optionLabel='Work at Gate'
            onOption={handleGate}
            content={
                <>
                    <Typography id="work-preference" sx={{alignItems: 'center', gap: 1}}>
                        <b>Welcome</b>! Choose your work area to begin your shift. Or select Logout to exit
                    </Typography>
                </>
            }/>
    );
}

export default WorkPreferenceDialog;

