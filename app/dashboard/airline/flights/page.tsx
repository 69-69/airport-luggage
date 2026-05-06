'use client';

import React, {useEffect} from "react";
import UITable from "@/components/uiTable";
import {Alert, Box, Typography} from "@mui/material";
import {DataRow} from "@/types/dataRow";
import {useRouter} from "next/navigation";
import {Flight, Passenger} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {passengerService} from "@/actions/services/passengerService";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";
import { toTitleCase} from "@/utils/util";
import {RoleEnum} from "@/types/userRole";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import RoleGuard from "@/actions/roleGuard";
import {formatTime} from "@/utils/validators";

interface FlightRow extends DataRow {
    flight: string;
    terminal: string;
    gate: string;
    tickets: number;
    destination: string;
    action: string;
}

const columns = ["flight", "gate", "tickets", "terminal", "destination", "departure", "action"];

const AirlineFlightsTable = () => {
    const {user, loading} = useAuth();

    const router = useRouter();
    const [flightRows, setFlightRows] = React.useState<Flight[]>([]);

    if (loading) return <FullScreenLoader/>

    // Fetch Flight list
    const fetchFlights = () => {
        try {
            if (!user?.airline) return;

            // Get airline airlineCode (e.g., "BA")
            const airlineCode = user.airline.split(" - ")[0];

            const passengers: Passenger[] = passengerService.getAll();

            // Keep only passengers whose flight starts with the airline airlineCode
            const passengersFlightNumbers: string[] = passengers
                .filter(p => p.flightNumber.startsWith(airlineCode))
                .map(p => p.flightNumber);

            // Get matching flights
            const res: Flight[] =
                flightService.getAllByFlightNumber(passengersFlightNumbers);

            setFlightRows(res);
        } catch (e) {
            console.error("Error fetching passengers with their associated flights:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchFlights(), []);

    return (
        <RoleGuard allowedRoles={[RoleEnum.AIRLINE]}>
            <PageTitleUpdater />
            {/*<Box component="section" sx={{p: 2, ml: {md: 30}, width: {xs: '100%', sm: '80%', md: '80%',}}}>*/}
            {flightRows ? (
                <UITable<FlightRow>
                    columns={columns}
                    rows={flightRows.map(f => ({
                        flight: f.flightNumber.toUpperCase(),
                        tickets: f?.tickets.length ?? 0,
                        gate: f.gate.toUpperCase(),
                        terminal: f.terminal.toUpperCase(),
                        destination: toTitleCase(f.destination),
                        departure: formatTime(f.departureTime),
                        action: "View Manifest",
                    }))}
                    title='Airline Flight info'
                    topAlignment='center'
                    topButton={
                        <Typography variant="h6" sx={{fontWeight: 'normal'}} gutterBottom>
                            [ Current Flights ]
                        </Typography>
                    }
                    onActionCallback={(row: FlightRow) => router.push(`/dashboard/airline/${row.flight}`)}
                />
            ) : (
                <Alert severity='info' sx={{mb: 2}}>
                    No flights available.
                </Alert>
            )}
            {/*</Box>*/}
        </RoleGuard>
    );
}

export default AirlineFlightsTable;

/*const rows: FlightRow[] = [
    {
        flight: "AA3245",
        terminal: "T3",
        gate: "G5",
        passengers: 209,
        action: "View Manifest",
    },
    {
        flight: "UA9868",
        terminal: "T9",
        gate: "G9",
        passengers: 699,
        action: "View Manifest",
    },
];*/