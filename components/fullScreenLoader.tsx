'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const FullScreenLoader = ({ message = 'Loading...' }: { message?: string }) => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                bgcolor: 'background.default',
            }}
        >
            <CircularProgress />
            <Typography variant="h6" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
};

export default FullScreenLoader;
