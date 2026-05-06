'use client';

import React, {useEffect, useState} from 'react';
import {Typography} from "@mui/material";
import UITable from "@/components/uiTable";
import {DataRow} from "@/types/dataRow";
import {AuthUser, Bag, BagLocationEnum, Flight} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {toTitleCase} from "@/utils/util";
import {bagService} from "@/actions/services/bagService";
import {formatTime} from "@/utils/validators";
import ClearanceDialog from "@/components/ground/securityClearanceDialog";


interface BaggageRow extends DataRow {
    bagId: string;
    flight: string;
    destination: string;
    departure: string;
    ticket: string;
    weight: string;
    gate: string;
    terminal: string;
    status: string;
    action: string;
    // passengers: number;
}

const columns = ["bag id", "weight", "flight", "destination", "departure", "ticket", "gate", "terminal", "status", "action"];

const WorkAtClearanceDashboard = ({user}: { user: AuthUser | null }) => {

    // const [isConfirm, setConfirm] = React.useState<boolean>(false);
    const [showClearance, setShowClearance] = React.useState<boolean>(false);
    const [selectedRow, setSelectedRow] = React.useState<DataRow>();
    const [rows, setRows] = useState<BaggageRow[]>([]);
    const [flight, setFlight] = useState<Flight>();
    // const [outcome, setOutcome] = React.useState<OutcomeProps>();

    // Fetch Flight list
    const fetchFlights = () => {
        try {
            // const airlineCode = user?.airline?.split(" - ")[0];
            if (!user?.workMode) return;

            const flights: Flight[] = flightService.getAll();

            // Ground staff only restricted by gate (NOT airline)
            const gateFlights = flights.filter(
                (f: Flight) => f.airlineName === user.airline
            );

            if (!gateFlights.length) {
                setRows([]);
                return;
            }

            const flight = gateFlights[0];
            setFlight(flight);

            /// Recent change [allTickets]
            const allTickets = gateFlights.flatMap(f => f.tickets);

            const bags: Bag[] = bagService.getAllByTickets(allTickets) // tickets: string[]
                .filter((b) =>
                    b.location === BagLocationEnum.CHECKIN_COUNTER
                    || b.location === BagLocationEnum.SECURITY_CHECK
                );

            const mappedRows: BaggageRow[] = bags.map((b) => ({
                bagId: b.bagId.toString(),
                weight: b.weight + " kg",
                flight: flight.flightNumber.toUpperCase(),
                destination: toTitleCase(flight.destination),
                departure: formatTime(flight.departureTime),
                ticket: b.ticketNumber,
                gate: flight.gate.toUpperCase(),
                terminal: flight.terminal.toUpperCase(),
                status: b.location as string,
                action: "Change Bag Status"
                // passengers: flight.tickets?.length ?? 0,
            }));

            setRows(mappedRows);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchFlights(), []);

    return (
        <>
            <UITable<BaggageRow>
                topAlignment='center'
                title='Security Clearance Dashboard'
                name={toTitleCase(user?.lastName ?? 'Staff') + (user?.workMode ? ' at ' + toTitleCase(user.workMode) : '')}
                columns={columns}
                rows={rows}
                topButton={
                    <Typography variant="h6" component="h4" fontWeight="normal" align="left" gutterBottom>
                        [ Bags Inspection: <b>{flight?.airlineName}</b> ]
                    </Typography>
                }
                onActionCallback={(row) => {
                    setSelectedRow(row);
                    setShowClearance(true);
                    // setOutcome(undefined);
                    // setConfirm(true);
                }}
            />

            <ClearanceDialog
                open={showClearance}
                onClose={() => setShowClearance(false)}
                reloadData={fetchFlights}
                selectedRow={selectedRow}
                terminal={flight?.terminal}
                gate={flight?.gate}
            />

            {/*Confirm Move Bags To Gate action*/}
            {/*<ConfirmEntityDialog
                open={isConfirm}
                onClose={() => setConfirm(false)}
                title="Security Clearance"
                dataId={selectedRow?.flight?.toString() ?? ''}
                message={
                    <>
                        <div>
                            Are you sure you want to clear the bag with ID <b>{selectedRow?.bagId} </b>
                            from Flight <b>{selectedRow?.flight}</b>
                             at Gate <b>{selectedRow?.terminal}-{selectedRow?.gate}</b>
                        </div>
                        {outcome && outcome.status !== undefined && (
                            <Alert severity={outcome.status}>{outcome.message}</Alert>
                        )}
                    </>
                }
                onConfirm={(v) => onLoadBagToPlane(v)}
            />*/}
        </>
    )
}

export default WorkAtClearanceDashboard;

