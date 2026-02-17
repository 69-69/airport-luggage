'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer = ()=>  {
    return (
        <Box
            component="footer"
            sx={{
                mt: 'auto',
                py: 2,
                px: 2,
                textAlign: 'center',
                bgcolor: 'grey.100',
            }}
        >
            <Typography variant="body2">
                CS 7336 – Web Application Development | Spring 2026
            </Typography>
            <Typography variant="caption">
                &copy;{new Date().getFullYear()} Airport Luggage Handling System
            </Typography>
        </Box>
    );
}
export default Footer;
