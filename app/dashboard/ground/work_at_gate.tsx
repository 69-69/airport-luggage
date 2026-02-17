'use client';

import React, {useEffect, useState} from 'react';
import {Alert, Typography} from "@mui/material";
import UITable from "@/components/uiTable";
import {DataRow} from "@/types/dataRow";
import ConfirmEntityDialog from "@/components/confirmEntityDialog";
import {AuthUser, Bag, BagLocationEnum, Flight, PassengerStatusEnum} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {OutcomeProps, toTitleCase} from "@/utils/util";
import {bagService} from "@/actions/services/bagService";
import {formatTime} from "@/utils/validators";
import {passengerService} from "@/actions/services/passengerService";


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
    // passengers: number;
    action: string;
}

const columns = ["bag id", "weight", "flight", "destination", "departure", "ticket", "gate", "terminal", "status", "action"];

const WorkAtGateDashboard = ({user}: { user: AuthUser | null }) => {

    const [isConfirm, setConfirm] = React.useState<boolean>(false);
    const [selectedRow, setSelectedRow] = React.useState<DataRow>();
    const [rows, setRows] = useState<BaggageRow[]>([]);
    const [flight, setFlight] = useState<Flight>();
    const [outcome, setOutcome] = React.useState<OutcomeProps>();

    // Fetch Flight list
    const fetchFlights = () => {
        try {
            // const airlineCode = user?.airline?.split(" - ")[0];
            if (!user?.workMode) return;

            const flights: Flight[] = flightService.getAll();

            // Ground staff only restricted by gate (NOT airline)
            const gateFlights = flights.filter(
                (f: Flight) => f.gate === user.workMode
            );

            if (!gateFlights.length) {
                setRows([]);
                return;
            }

            const flight = gateFlights[0];
            setFlight(flight);

            const bags: Bag[] = bagService.getAllByTickets(flight.tickets)
                .filter((b) => b.location === BagLocationEnum.CHECKIN_COUNTER);

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
                // passengers: flight.tickets?.length ?? 0,
                action: "Load Bag"
            }));

            setRows(mappedRows);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchFlights(), []);

    /// Load Bags To Plane/Flight
    const onLoadBagToPlane = (proceed: boolean) => {
        if (!proceed || !selectedRow?.bagId || !selectedRow?.ticket) return;
        console.log('proceed', proceed, selectedRow.bagId || selectedRow.ticket);

        // Validation: Ensure passenger is boarded
        const passenger = passengerService.findByTicket(selectedRow.ticket.toString());
        if (!passenger || passenger.status !== PassengerStatusEnum.BOARDED) {
            return setOutcome({
                status: 'error',
                message: `Cannot load bag with ID ${selectedRow.bagId}: Passenger has not boarded.`,
            });
        }

        // Validation: Ensure bag is at the gate
        if ((selectedRow.status as BagLocationEnum) !== BagLocationEnum.GATE) {
            return setOutcome({
                status: 'error',
                message: `Cannot load bag with ID ${selectedRow.bagId}: Bag is not at the gate: Not Cleared.`,
            });
        }

        try {
            bagService.loadToFlight(selectedRow.bagId.toString());
            fetchFlights();

            return setOutcome({
                status: 'success',
                message: `Bags loaded to Flight ${flight?.flightNumber.toUpperCase()} successfully`,
            });

        } catch (err) {
            return setOutcome({
                status: 'error',
                message: `Failed to load bags: ${err instanceof Error ? err.message : 'Failed to load bags'}`
            });
        }
    }

    return (
        <>
            <UITable<BaggageRow>
                title='Ground Staff Dashboard'
                name={toTitleCase(user?.lastName ?? 'Staff') + (user?.workMode ? ' at GATE: ' + user.workMode.toUpperCase() : '')}
                columns={columns}
                topAlignment='justify'
                rows={rows}
                topButton={
                    <Typography variant="h6" component="h4" fontWeight="normal" align="left" gutterBottom>
                        [ Bags to be loaded to <b>Flight: {flight?.flightNumber}</b> ]
                    </Typography>
                }
                onActionCallback={(row) => {
                    setOutcome(undefined);
                    setSelectedRow(row);
                    setConfirm(true);
                }}
            />

            {/*
            Move Bags To Gate Dialog
            isOpenBoard && (<MoveBagToGateDialog
                open={isOpenBoard}
                onClose={() => setShowMoveDialog(false)}
                onMoveBag={(row: DataRow) => {
                    setConfirm(true);
                    setSelectedRow(row);
                }}
            />)

            Load Bags To Plane Dialog
            openChangeGate && (<LoadBagToPlaneDialog
                open={openChangeGate}
                onClose={() => setShowLoadDialog(false)}
                onLoadBag={onLoadBagToPlane}
            />)
            */}

            {/*Confirm Move Bags To Gate action*/}
            <ConfirmEntityDialog
                open={isConfirm}
                onClose={() => setConfirm(false)}
                title="Confirm Load"
                dataId={selectedRow?.flight?.toString() ?? ''}
                message={
                    <>
                        <div>
                            Are you sure you want to load the bag with ID <b>{selectedRow?.bagId} </b>
                            to Flight <b>{selectedRow?.flight}</b> at
                            Gate <b>{selectedRow?.terminal}-{selectedRow?.gate}</b>
                        </div>
                        {outcome && outcome.status !== undefined && (
                            <Alert severity={outcome.status}>{outcome.message}</Alert>
                        )}
                    </>
                }
                onConfirm={(v) => onLoadBagToPlane(v)}
            />
        </>
    )
}

export default WorkAtGateDashboard;

/*
                        <Grid container rowSpacing={2} columnSpacing={{xs: 1, sm: 2, md: 2}} sx={{
                            justifyContent: "end"
                        }}>
                            <Grid size={{xs: 12, md: 3}}>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        textTransform: 'none',
                                        '&': {boxShadow: 3},
                                    }}
                                    onClick={() => setShowMoveDialog(true)}
                                >
                                    Move Bags to Gate
                                </Button>
                            </Grid>
                            <Grid size={{xs: 12, md: 3}}>
                            </Grid>
                        </Grid>*/
