'use client';

import React, {useEffect} from 'react';
import {Box, Button, Typography} from "@mui/material";
import {Grid, Stack} from "@mui/system";
import AddFlightDialog from "@/components/admin/addFlightDialog";
import {DataRow} from "@/types/dataRow";
import {addStaff} from "@/actions/endpoints";
import AddPassengerDialog from "@/components/admin/addPassengerDialog";
import AddStaffDialog from "@/components/admin/addStaffDialog";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import {RoleEnum} from "@/types/userRole";
import RoleGuard from "@/actions/roleGuard";
import {Flight, Passenger, SendResult, User} from "@/types/models";
import {OutcomeProps} from "@/utils/util";
import {flightService} from "@/actions/services/flightService";
import {passengerService} from "@/actions/services/passengerService";
import {userService} from "@/actions/services/userService";

const AdminDashboard = () => {
    const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [isOpenFlight, setOpenFlight] = React.useState(false);
    const [isOpenPassenger, setOpenPassenger] = React.useState(false);
    const [isOpenStaff, setOpenStaff] = React.useState(false);
    const [totalActiveFlights, setTotalActiveFlights] = React.useState<number>(0);
    const [totalPassengers, setTotalPassengers] = React.useState<number>(0);
    const [totalStaffs, setTotalStaffs] = React.useState<number>(0);

    const getMetrics = () => {
        try {
            const flights: Flight[] = flightService.getAll();
            const passengers: Passenger[] = passengerService.getAll();
            const users: User[] = userService.getAll();

            setTotalActiveFlights(flights.length);
            setTotalPassengers(passengers.length);
            setTotalStaffs(users.length);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    // Initial fetch
    useEffect(() => getMetrics(), []);

    const handleAddStaff = async (row: DataRow) => {
        const result: SendResult = await addStaff(row);

        if (result.success) {
            setOutcome({status: 'success', message: 'Staff added and email sent successfully',});
            console.log("Staff added!");
            // Clear the outcome
            setOutcome(undefined);
        } else {
            setOutcome({status: 'error', message: result.error ?? ''});
            console.log(result.error);
        }
    };

    return (
        <RoleGuard allowedRoles={[RoleEnum.ADMIN]}>
            <PageTitleUpdater/>
            <Box component="section" sx={{p: 2, ml: {md: 40}, width: {xs: '100%', sm: '80%', md: '80%',}}}>
                {/* Page title */}
                <Typography variant="h4" component="h1" sx={{textAlign: 'center'}} gutterBottom>
                    Administrator Dashboard
                </Typography>

                <Typography variant="body1" sx={{mb: 3, textAlign: 'center'}}>
                    <b>Welcome</b>, Admin!
                </Typography>

                <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}} sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    {/* Quick Actions */}
                    <Grid size={{xs: 12, md: 4}}>
                        <Typography variant="h6" component="h4" gutterBottom>
                            [ Quick Actions ]
                        </Typography>

                        <Stack spacing={2} component="ul" sx={{listStyle: 'none', p: 0, m: 0}}>
                            {[
                                {label: 'Add Flight', open: () => setOpenFlight(true)},
                                {
                                    label: 'Add Passenger', open: () => {
                                        setOutcome({status: undefined, message: ''});
                                        setOpenPassenger(true);
                                    }
                                },
                                {label: 'Add Staff Account', open: () => setOpenStaff(true)},
                            ].map((action) => (
                                <li key={action.label}>
                                    <Button
                                        variant='outlined'
                                        size="large"
                                        sx={{
                                            width: '100%',
                                            textTransform: 'none',
                                            '&': {boxShadow: 3},
                                        }}
                                        onClick={action.open}
                                    >
                                        {action.label}
                                    </Button>
                                </li>
                            ))}
                        </Stack>
                    </Grid>

                    {/* System Overview */}
                    <Grid size={{xs: 12, md: 4}}>
                        <Typography variant="h6" component="h4" gutterBottom>
                            [ System Overview ]
                        </Typography>
                        {/* Add your system info here */}
                        <Stack spacing={2} component="ul" sx={{listStyle: 'none', p: 0, m: 0, alignItems: 'start'}}>
                            {[
                                {label: 'Active Flights', data: totalActiveFlights},
                                {label: 'Passengers Today', data: totalPassengers},
                                {label: 'Staff Accounts', data: totalStaffs},
                            ].map((action) => (
                                <li key={action.label}>
                                    <Button
                                        variant="text"
                                        size="large"
                                        sx={{
                                            width: '100%',
                                            fontWeight: 'normal',
                                            textTransform: 'none',
                                            justifyContent: 'flex-start',
                                            '&:hover': {textDecorationLine: 'underline'},
                                        }}
                                    >
                                        <b style={{marginRight: 8}}>{action.label}:</b>{action.data}
                                    </Button>
                                </li>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
                {isOpenFlight && (<AddFlightDialog
                    open={isOpenFlight}
                    onClose={() => setOpenFlight(false)}
                    // outcome={outcome}
                    // setOutcome={setOutcome}
                    // onAddFlight={handleAddFlight}
                />)}
                {isOpenPassenger && (<AddPassengerDialog
                    open={isOpenPassenger}
                    onClose={() => setOpenPassenger(false)}
                    // outcome={outcome}
                    // setOutcome={setOutcome}
                    // onAddPassenger={handleAddPassenger}
                />)}
                {isOpenStaff && (<AddStaffDialog
                    open={isOpenStaff}
                    outcome={outcome}
                    setOutcome={setOutcome}
                    onClose={() => setOpenStaff(false)}
                    onAddStaff={handleAddStaff}
                />)}
            </Box>
        </RoleGuard>
    )
}

export default AdminDashboard;

/*
    const handleAddFlight = (row: DataRow) => {
        const result: SendResult = addFlight(row);

        if (result.success) {
            setOutcome({status: 'success', message: 'Flight added successfully',});
            console.log("Flight added!");
        } else {
            setOutcome({status: 'error', message: result.error ?? ''});
            console.log(result.error);
        }
    };

    const handleAddPassenger = (row: DataRow) => {
        const result: SendResult = addPassenger(row);

        if (result.success) {
            setOutcome({status: 'success', message: 'Passenger added successfully',});
            console.log("Passenger added!");
        } else {
            setOutcome({status: 'error', message: result.error ?? ''});
            console.log(result.error);
        }
    };*/
