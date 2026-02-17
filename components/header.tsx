'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {RoleEnum} from "@/types/userRole";
import {getAirlineByCode, manualAirlines, toSentenceCase} from "@/utils/util";
import {UserRole} from "@/types/models";

interface HeaderProps {
    role?: UserRole;
    username?: string;
    workMode?: string;
    airline?: string;
    onLogout?: (redirectPath?: string) => void;
}

const Header = ({username, role, airline, onLogout, workMode}: HeaderProps) => {
    const tagName = (role as RoleEnum) !== RoleEnum.ADMIN && airline ? airline : role;
    // tagName = manualAirlines.find(a=>a.startsWith(airlineCode)) ?? airlineCode;

    const handleLogout = async () => {
        const id = Math.floor(Date.now() / 1000);
        if (onLogout) {
            onLogout(`/?logout=${id}`);
        }
    }
    return (
        <AppBar position="fixed" color="primary" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
            <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography variant="h6" component="div" sx={{ml: 5}}>
                    ✈️ Airport Luggage Handling System
                </Typography>
                {username && (
                    <Box>
                        <Typography component="span" sx={{mr: 2}}>
                            {tagName?.toUpperCase()} | {workMode && (toSentenceCase(workMode) + ' | ')} {toSentenceCase(username)}
                        </Typography>
                        <Button color="inherit" variant="outlined" size="small" sx={{textTransform: 'none'}}
                                onClick={handleLogout}>
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    )
}

export default Header;


