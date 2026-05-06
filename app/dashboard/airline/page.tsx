'use client';

import React, {useEffect} from "react";
import UITable from "@/components/uiTable";
import {Alert, Grid, Typography} from "@mui/material";
import {DataRow} from "@/types/dataRow";
import {useRouter} from "next/navigation";
import {Flight, Passenger} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {passengerService} from "@/actions/services/passengerService";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";
import {RoleEnum} from "@/types/userRole";
import RoleGuard from "@/actions/roleGuard";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import {formatTime} from "@/utils/validators";

interface FlightRow extends DataRow {
    flight: string;
    terminal: string;
    gate: string;
    passengers: number;
    action: string;
}

const columns = ["flight", "terminal", "gate", "passengers", "departure", "action"];

const AirlineStaffDashboard = () => {
    const {user, loading} = useAuth();

    const router = useRouter();
    // const [checkinData, setCheckinData] = React.useState<[string, string]>(['', '']);
    // const [isOpenCheckIn, setOpenCheckIn] = React.useState(false);
    // const [openVerify, setOpenVerify] = React.useState<[boolean, FlightRow | null]>([false, null]);
    const [flightRows, setFlightRows] = React.useState<Flight[]>([]);
    // const counts: Record<string, number> = {};
    const [passengerCounts, setPassengerCounts] = React.useState<Record<string, number>>({});

    if (loading) return <FullScreenLoader/>

    // Fetch Flight list
    const fetchFlights = () => {
        try {
            /*const passengersFlightNumbers: string[] =
                passengers.map(p => {
                    passengerCounts[p.flightNumber] =
                        (passengerCounts[p.flightNumber] || 0) + 1;
                    return p.flightNumber;
                });*/

            if (!user?.airline) return;

            // Get airline airlineCode (e.g., "BA")
            const airlineCode = user.airline.split(" - ")[0];

            const passengers: Passenger[] = passengerService.getAll();

            // Keep only passengers whose flight starts with the airline airlineCode
            const counts: Record<string, number> = {};

            const flightNumbers: string[] = passengers
                .filter(p => p.flightNumber.startsWith(airlineCode))
                .map(p => {
                    counts[p.flightNumber] =
                        (counts[p.flightNumber] || 0) + 1;
                    return p.flightNumber;
                });

            setPassengerCounts(counts);

            // const flightNumbers = Object.keys(counts);
            // Get matching flights
            const res: Flight[] =
                flightService.getAllByFlightNumber(flightNumbers);

            setFlightRows(res);
        } catch (e) {
            console.error("Error fetching passengers with their associated flights:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchFlights(), []);

    return (
        <RoleGuard allowedRoles={[RoleEnum.AIRLINE]}>
            <PageTitleUpdater/>
            {flightRows ? (
                    <UITable<FlightRow>
                        columns={columns}
                        rows={flightRows.map(f => ({
                            flight: f.flightNumber.toUpperCase(),
                            terminal: f.terminal.toUpperCase(),
                            gate: f.gate.toUpperCase(),
                            passengers: passengerCounts[f.flightNumber] ?? 0,
                            departure: formatTime(f.departureTime),
                            action: "View Manifest",
                        }))}
                        title={user?.airline + " Counter"}
                        name={user?.lastName}
                        topAlignment='center'
                        // onStatusCallback={(row: FlightRow) => setOpenVerify([true, row])}
                        onActionCallback={(row: FlightRow) => router.push(`/dashboard/airline/${row.flight}`)}
                        topButton={
                            <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}} sx={{
                                justifyContent: "space-between",
                            }}>
                                {/* Quick Actions */}
                                <Grid size={{xs: 12, md: 2}}>
                                    <Typography variant="h6" component="h4" fontWeight='normal' gutterBottom>
                                        [ Counter ]
                                    </Typography>
                                </Grid>

                                {/* System Overview */}
                                {/*<Grid size={{xs: 12, md: 4}}>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            width: '100%',
                                            textTransform: 'none',
                                            '&': {boxShadow: 3},
                                        }}
                                        onClick={() => setOpenVerify(true)}
                                    >
                                        Check-In
                                    </Button>
                                </Grid>*/}
                            </Grid>
                        }
                    />
                ) : (
                    <Alert severity='info' sx={{mb: 2}}>
                        No flights available.
                    </Alert>
                )}
                {/*Very Passenger Dialog: Before checking-in
                {openVerify && (<VerifyPassengerDialog
                    open={openVerify[0]}
                    ticket={openVerify[1]?.flight ?? ''}
                    idNo={openVerify[1]?.flight ?? ''}
                    onClose={() => setOpenVerify([false, null])}
                    onProceedToCheckIn={(ticket, flight) => {
                        setCheckinData([ticket, flight]);
                        setOpenCheckIn(true);
                    }}
                />)}

                Check-In Dialog
                {isOpenCheckIn && (<CheckInDialog
                    open={isOpenCheckIn}
                    ticket={checkinData[0]}
                    flight={checkinData[1]}
                    onClose={() => setOpenCheckIn(false)}
                />)}*/}
        </RoleGuard>
    );
}

export default AirlineStaffDashboard;
