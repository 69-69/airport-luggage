'use client';

import React, {useEffect} from 'react';
import {Button, Container, Typography} from "@mui/material";
import {Grid} from "@mui/system";
import UITable from "@/components/uiTable";
import {DataRow} from "@/types/dataRow";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import MyBagDialog from "@/components/passenger/myBagDialog";
import {RoleEnum} from "@/types/userRole";
import RoleGuard from "@/actions/roleGuard";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";
import {Flight, FlightSnapshot} from "@/types/models";
import {passengerService} from "@/actions/services/passengerService";
import {flightService} from "@/actions/services/flightService";


interface SummaryRow extends DataRow {
    flight: string;
    gate: string;
    terminal: string;
}

const PassengerDashboard = () => {
    const [openMyBags, setMyBags] = React.useState(false);
    const [tickets, setTickets] = React.useState<string[]>([]);
    const [flightSnapshots, setFlightSnapshots] = React.useState<Flight[]>([]);
    const {user, loading} = useAuth();

    if (loading) return <FullScreenLoader/>;

    useEffect(() => {
        const loadFlights = () => {
            if (user?.username) {
                // Passenger's 'username': Identification (Passport/Driver License)
                const flightSnapshots: FlightSnapshot[] = passengerService.findSnapshotById(user.username);

                const flightNumbers = flightSnapshots.map(f => f.flightNumber);
                // NOTE: Auth 'user?.airline' field contains "flightNumber" for Passenger
                const passFlights = flightService.getAllByFlightNumber(flightNumbers);
                if (flightNumbers && passFlights) {
                    setFlightSnapshots(passFlights);
                }

                const tickets = flightSnapshots.map(f => f.ticketNumber);
                if(tickets) {
                    setTickets(tickets);
                }
            }
        };

        loadFlights();
    }, [user]);

    return (
        <RoleGuard allowedRoles={[RoleEnum.PASSENGER]}>
            <PageTitleUpdater/>

            {/*Active's Flight Info*/}
            <UITable<SummaryRow>
                title='Passenger Dashboard'
                name={user?.lastName}
                rows={(
                    Array.isArray(flightSnapshots) ? flightSnapshots : []
                ).map((f: Flight) => ({
                    flight: f.flightNumber,
                    gate: f.gate,
                    terminal: f.terminal,
                }) as SummaryRow)}
                columns={["flight", "gate", "terminal"]}
                topAlignment='justify'
                topButton={
                    <Container sx={{justifyContent: "space-between", mr: 0, pr: 0}}>
                        {/* Buttons */}
                        <Grid container rowSpacing={2} columnSpacing={{xs: 1, sm: 2, md: 2}} sx={{
                            justifyContent: "end"
                        }}>
                            {/*<Grid size={{xs: 12, md: 2}}>
                            </Grid>
                            <Grid size={{xs: 12, md: 2}}>
                            <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        textTransform: 'none',
                                        '&': {boxShadow: 3},
                                    }}
                                    onClick={() => setMyGate(true)}
                                >
                                    My Gate
                                </Button>
                            </Grid>*/}
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    textTransform: 'none',
                                    '&': {boxShadow: 3},
                                }}
                                onClick={() => setMyBags(true)}
                            >
                                My Bags
                            </Button>
                        </Grid>

                        {/* Quick Actions */}
                        <Typography variant="h6" component="h4" gutterBottom>
                            [ Summary ]
                        </Typography>
                    </Container>
                }
            />

            {/*My Bags Dialog*/}
            {openMyBags && (<MyBagDialog
                open={openMyBags}
                tickets={tickets}
                onClose={() => setMyBags(false)}
            />)}

            {/*My Gate Dialog*/}
            {/*{openMyGate && (<MyGateDialog<MyGateRow>
                open={openMyGate}
                columns={gateColumns}
                rows={gateRows}
                onClose={() => setMyGate(false)}
            />)}*/}
        </RoleGuard>
    )
}
export default PassengerDashboard
