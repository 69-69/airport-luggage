'use client';

import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {usePathname, useRouter} from 'next/navigation';
import {useTheme, Box, Toolbar} from '@mui/material';
import {UserRole} from "@/types/models";

interface SidebarProps {
    role: UserRole;
    isMobile:boolean;
}

const menuItemsByRole: Record<UserRole, { label: string; path: string }[]> = {
    ADMIN: [
        {label: 'Dashboard', path: '/dashboard/admin'},
        {label: 'Flights', path: '/dashboard/admin/flights'},
        {label: 'Passengers', path: '/dashboard/admin/passengers'},
        {label: 'Staffs', path: '/dashboard/admin/staffs'},
        {label: 'Message Board', path: '/dashboard/messages'},
    ],
    AIRLINE: [ // Airline Staff
        {label: 'Dashboard', path: '/dashboard/airline'},
        {label: 'Flights', path: '/dashboard/airline/flights'},
        {label: 'Message Board', path: '/dashboard/messages'},
    ],
    GATE: [ // Gate Staff
        {label: 'Dashboard', path: '/dashboard/gate'},
        {label: 'Onboard Manifest', path: '/dashboard/gate/onboard/'},
        {label: 'Gate Info', path: '/dashboard/gate/info'},
        {label: 'Message Board', path: '/dashboard/messages'},
    ],
    GROUND: [ // Ground Staff
        {label: 'Dashboard', path: '/dashboard/ground'},
        {label: 'Baggage Manifest', path: '/dashboard/ground/baggage'},
        {label: 'Message Board', path: '/dashboard/messages'},
    ],
    PASSENGER: [],
};

export default function Sidebar({role, isMobile}: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box sx={{width: 200}}>
            <Toolbar/>
            <List>
                {menuItemsByRole[role]?.map((item) => (
                    <ListItemButton
                        key={item.path}
                        selected={pathname === item.path}
                        onClick={() => {
                            router.push(item.path);
                            if (isMobile) setMobileOpen(false); // close on mobile
                        }}
                    >
                        <ListItemText primary={item.label}/>
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            {isMobile && (
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{m: 1, position: 'fixed', top: 0, left: 0, zIndex: theme.zIndex.drawer + 1}}
                >
                    <MenuIcon/>
                </IconButton>
            )}

            {role !== 'PASSENGER' &&
                (<Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    ModalProps={{keepMounted: true}} // Better mobile performance
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: 200,
                            boxSizing: 'border-box',
                            mt: '20px', // offset for AppBar
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>)}
        </>
    );
}
