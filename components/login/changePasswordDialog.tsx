'use client';
import * as React from 'react';
import {TextField, Typography,} from '@mui/material';
import Info from "@mui/icons-material/Info";
import UiDialog from "@/components/uiDialog";
import {clearErrorAndSet, passwordRegex} from "@/utils/util";


interface ChangePasswordDialogProps {
    open: boolean;
    onClose: () => void;
    loginPassword: string;
    onChangePassword: (newPassword: string) => void;
}

const ChangePasswordDialog = ({
                                  open,
                                  onClose,
                                  loginPassword,
                                  onChangePassword,
                              }: ChangePasswordDialogProps) => {

    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    const handlePasswordChange = () => {
        if (loginPassword !== oldPassword) {
            setError('Current password is not valid');
            return;
        }
        if (loginPassword === newPassword) {
            setError('Your new password must be different from your old password.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }
        if (!passwordRegex.test(newPassword)) {
            setError(
                'Password must be at least 6 characters with uppercase, lowercase, and number'
            );
            return;
        }

        setError('');
        onChangePassword(newPassword);
        onClose();
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Change Password"
            cancelLabel='Cancel'
            confirmLabel='Save Changes'
            confirmDisabled={
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                (error?.length ?? 0) > 0
            }
            onConfirm={handlePasswordChange}
            content={
                <>
                    <Typography
                        id="confirm-dialog-description"
                        sx={{textDecorationLine: 'underline', display: 'flex', alignItems: 'center', gap: 1}}
                    >
                        <Info fontSize="small"/>
                        Change the temporary password used during your first login
                    </Typography>
                    <TextField
                        label="Current Password"
                        type="password"
                        fullWidth
                        size="small"
                        value={oldPassword}
                        onChange={clearErrorAndSet(setOldPassword, setError)}
                        slotProps={{input: {id: 'current-password'},}}
                    />
                    <TextField
                        label="New Password"
                        type="password"
                        fullWidth
                        size="small"
                        value={newPassword}
                        onChange={clearErrorAndSet(setNewPassword, setError)}
                        slotProps={{input: {id: 'new-password'},}}
                    />
                    <TextField
                        label="Confirm New Password"
                        type="password"
                        fullWidth
                        size="small"
                        value={confirmPassword}
                        onChange={clearErrorAndSet(setConfirmPassword, setError)}
                        slotProps={{input: {id: 'confirm-new-password'}}}
                    />

                    {error && (
                        <Typography color="error" variant="body2" sx={{mb:1}}>
                            {error}
                        </Typography>
                    )}
                </>
            }/>
    );
}

export default ChangePasswordDialog;

