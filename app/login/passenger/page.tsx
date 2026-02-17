'use client';

import React, {useState} from 'react';
import {Box, Button, TextField, Typography, Paper, Divider, Link} from '@mui/material';
import { useSearchParams} from 'next/navigation';
import {dashboardRedirectPath, RoleEnum} from "@/types/userRole";
import {useAuth} from "@/actions/authContext";
import {clearErrorAndSet, isNumeric} from "@/utils/util";
import {authService} from "@/actions/services/authService";
import {passengerService} from "@/actions/services/passengerService";

const PassengerLoginForm = () => {
    const {login} = useAuth();
    // const searchParams = useSearchParams();
    const [ticketNumber, setTicketNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [idNumber, setIdNumber] = useState('');

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();// redirect after login

        if (ticketNumber.length!==10 || !isNumeric(ticketNumber)) {
            setError('Please enter a valid 10 digit ticket number.');
            return;
        }
        let id = idNumber.trim();
        if (id.length !== 6 || !isNumeric(id)) {
            setError('Please enter a valid 6 digit ID number.');
            return;
        }

        // Call authService
        const result = passengerService.login(ticketNumber, id);

        if (!result.success) {
            setError(result.error || 'Passenger not found.');
            return;
        }

        // Login success → store in AuthContext
        login(result.user, true, dashboardRedirectPath({role: result.user.role}));
    };

    return (
        <Box
            sx={{
                minWidth: {xs: '90%', sm: 400},
            }}
        >
            <Paper sx={{
                p: 4, width: '100%',
                border: '1px dashed grey',
            }} elevation={3}>
                <Typography variant="h5" sx={{mb: 3, textAlign: 'center'}}>
                    Passenger Login
                </Typography>
                <form onSubmit={handleSubmit}
                      style={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                      }}>
                    <TextField
                        label="Ticket Number"
                        variant="outlined"
                        size="small"
                        fullWidth
                        required
                        helperText="Ticket number can be up to 10 digits"
                        slotProps={{
                            input: {
                                inputProps: {maxLength: 10,}
                            },
                        }}
                        sx={{mb: 2}}
                        value={ticketNumber}
                        onChange={clearErrorAndSet(setTicketNumber, setError)}
                    />
                    <TextField
                        label="Identification"
                        variant="outlined"
                        size="small"
                        fullWidth
                        required
                        slotProps={{
                            input: {
                                inputProps: {maxLength: 6,}
                            },
                        }}
                        sx={{mb: 3}}
                        value={idNumber}
                        helperText="ID number can be up to 6 digits"
                        onChange={clearErrorAndSet(setIdNumber, setError)}
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{mb: 1}}>
                            {error}
                        </Typography>
                    )}
                    <Button type="submit" variant="contained" color="primary"
                            sx={{textTransform: 'none'}}
                            disabled={!ticketNumber || !idNumber}
                            fullWidth
                    >
                        Login
                    </Button>
                    <Divider sx={{width: 200, my: 1}}>
                        +
                    </Divider>
                    <Link href="/">Back</Link>
                </form>
            </Paper>
        </Box>
    );
};

export default PassengerLoginForm;
