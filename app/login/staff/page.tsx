'use client';

import React, {useState} from 'react';
import {Box, Button, TextField, Typography, Paper, Divider, Link} from '@mui/material';
import {useRouter, useSearchParams} from 'next/navigation';
import ChangePasswordDialog from "@/components/login/changePasswordDialog";
import WorkPreferenceDialog from "@/components/login/workPreferenceDialog";
import GatePreferenceDialog from "@/components/login/gatePreferenceDialog";
import {useAuth} from "@/actions/authContext";
import {dashboardRedirectPath, RoleEnum} from "@/types/userRole";
import {clearErrorAndSet, passwordRegex} from "@/utils/util";
import {authService} from "@/actions/services/authService";
import {userService} from "@/actions/services/userService";

const StaffLoginForm = () => {
    const {login, user} = useAuth(); // Get current user from AuthContext

    const router = useRouter();
        const [error, setError] = useState<string | null>(null);
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const searchParams = useSearchParams();
        const [showGatePref, setGatePref] = useState(false);
        const [showWorkPref, setWorkPref] = useState(false);
        const [showChangePassword, setShowChangePassword] = useState(false);

        const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
            e.preventDefault();// redirect after login

            if (username.length < 4) {
                setError("Please enter valid username");
                return;
            }
            if (!passwordRegex.test(password)) {
                setError(
                    'Password must be at least 6 characters with uppercase, lowercase, and number'
                );
                return;
            }


            // Call authService
            const result = authService.login(username, password);

            if (!result.success) {
                setError(result.error);
                return;
            }

            // Login success → store in AuthContext
            login(result.user, false);

            // First login flow
            if (result.user.firstLogin) {
                setShowChangePassword(true);
                return;
            }

            // Role-based Work Preference BEFORE redirect
            if (result.user.role === RoleEnum.GATE) {
                setGatePref(true);
                return;
            }
            if (result.user.role === RoleEnum.GROUND) {
                setWorkPref(true);
                return;
            }

            // Role-based redirect
            const redirectPath =
                searchParams.get("redirect") || dashboardRedirectPath({role: result.user.role});
            router.push(redirectPath)
        };

        const handleChangePassword = (newPassword: string) => {
            if (!user) return; // safety check

            // Update user password in your localStorage backend
            userService.updatePassword(user.username, newPassword, false);

            setShowChangePassword(false); // Close Change Password Dialog

            /// Role-based Work Preference
            if (user.role === RoleEnum.GATE) {
                setGatePref(true);
                return;
            }
            if (user.role === RoleEnum.GROUND) {
                setWorkPref(true);
                return;
            }

            // Update AuthContext so UI reflects new password & firstLogin=false,
            // then Redirect based on role
            const redirectPath = dashboardRedirectPath({role: user.role});
            login({...user, firstLogin: false}, true, redirectPath);
        };


        return (
            <Box sx={{minWidth: {xs: '90%', sm: 400}}}>
                <Paper sx={{
                    p: 4, width: '100%',
                    border: '1px dashed grey',
                }} elevation={3}>
                    <Typography variant="h5" sx={{mb: 3, textAlign: 'center'}}>
                        Staff Login
                    </Typography>
                    <form onSubmit={handleSubmit}
                          style={{
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                          }}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            size="small"
                            fullWidth
                            required
                            sx={{mb: 2}}
                            value={username}
                            slotProps={{
                                input: {id: 'username', autoFocus: true},
                            }}
                            onChange={clearErrorAndSet(setUsername, setError)}
                        />
                        <TextField
                            label="Password"
                            variant="outlined"
                            type="password"
                            size="small"
                            fullWidth
                            required
                            sx={{mb: 3}}
                            value={password}
                            onChange={clearErrorAndSet(setPassword, setError)}
                        />
                        {error && (
                            <Typography color="error" variant="body2" sx={{mb: 1}}>
                                {error}
                            </Typography>
                        )}
                        <Button type="submit" variant="contained"
                                color="primary" sx={{textTransform: 'none'}}
                                disabled={!username || !password}
                                fullWidth
                        >
                            Login
                        </Button>
                        <Divider sx={{width: 200, my: 1}}>+</Divider>
                        <Link href="/">Back</Link>
                    </form>
                </Paper>


                {showChangePassword && (<ChangePasswordDialog
                    open={showChangePassword}
                    loginPassword={password}
                    onClose={() => setShowChangePassword(false)}
                    onChangePassword={handleChangePassword}
                />)}


                {/*GATE: Staffs Gate Preference Dialog*/}
                {showGatePref && (<GatePreferenceDialog
                    open={showGatePref}
                    onClose={() => setGatePref(false)}
                />)}


                {/*GROUND: Work Preference Dialog: Work at Gate or Clearance*/}
                {showWorkPref && (<WorkPreferenceDialog
                    open={showWorkPref}
                    onClose={() => setWorkPref(false)}
                    // If onGateSelected is TRUE, Show GatePreferenceDialog
                    onGateSelected={(v) => {
                        setWorkPref(false);
                        setGatePref(v);
                    }}
                />)}
            </Box>
        );
    }
;

export default StaffLoginForm;
