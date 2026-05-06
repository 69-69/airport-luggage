'use client';

import React, {useEffect, useState} from 'react';
import PageTitleUpdater from "@/components/pageTitleUpdater";
import {RoleEnum} from "@/types/userRole";
import RoleGuard from "@/actions/roleGuard";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";
import UITable from "@/components/uiTable";
import {Button, Container, Typography} from "@mui/material";
import {Grid} from "@mui/system";
import ConfirmDepartureDialog from "@/components/gate/confirmDepartureDialog";
import ConfirmEntityDialog from "@/components/confirmEntityDialog";
import ChangeGateDialog from "@/components/gate/changeGateDialog";
import {DataRow} from "@/types/dataRow";
import {Flight, MessageBoard, UserRole} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {OutcomeProps, toTitleCase} from "@/utils/util";
import {formatTime, setOutcomeHelper} from "@/utils/validators";
import {messageBoardService} from "@/actions/services/messageBoardService";
import {useRouter} from "next/navigation";


interface GateFlightRow extends DataRow {
    flight: string;
    terminal: string;
    gate: string;
    airline: string;
    // destination: string;
    // departure: string;
    // passengers: number;
    // update: string;
    // action: string;
}

const columns = ["gate", "terminal", "airline", "flight"/*, "destination", "departure", "passengers", "update","action"*/];


const GateStaffDashboard = () => {
    const {user, loading} = useAuth();

    // Flight Departure
    const [confirmDeparture, setConfirmDeparture] = useState(false);

    // Change Flight Gate
    const [confirmGateChange, setConfirmGateChange] = useState(false);
    const [showGateChange, setShowGateChange] = useState(false);
    const [selectedRow, setSelectedRow] = useState<DataRow>();
    const [newGate, setNewGate] = useState<DataRow>();

    // Passenger Boarding
    // const [showBoard, setShowBoard] = useState(false);
    // const [confirmBoard, setConfirmBoard] = useState(false);
    // const [ticketNumber, setTicketNumber] = useState<string>('');

    const [flightRows, setFlightRows] = useState<Flight[]>([]);
    // const [passenger, setPassenger] = React.useState<Passenger>();

    const [outcome, setOutcome] = useState<OutcomeProps>();
    const router = useRouter();

    // Fetch Flight list
    const fetchFlights = () => {
        try {
            // const airlineCode = user?.airline?.split(" - ")[0];
            const res: Flight[] = flightService.getAll();
            const gateFlights: Flight[] = res.filter(
                (f: Flight) =>
                    f.gate === user?.workMode &&
                    f.airlineName === user?.airline
            );

            setFlightRows(gateFlights);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchFlights(), []);

    // Flight Gate Change
    const handleGateChanges = async (proceed: boolean) => {
        console.log('Steve-Change Gate from:', proceed, newGate?.terminal, newGate?.gate);

        if (proceed && newGate?.terminal && user) {
            console.log('updating-flight gate');

            try {
                const existing = flightService.getAll().find(
                    f => f.terminal === newGate.terminal &&
                        f.gate === newGate.gate &&
                        f.flightNumber === selectedRow?.flight
                );

                if (existing) {
                    setConfirmGateChange(false);
                    return setOutcomeHelper('error',
                        `Gate ${newGate.terminal}-${newGate.gate} is already assigned to flight ${existing.flightNumber}`,
                        setOutcome
                    );
                }

                const gateTerminal = {
                    gate: newGate.gate as string,
                    terminal: newGate.terminal as string,
                };

                const flightNo = flightRows[0].flightNumber as string;

                const flight = flightService.changeGate(flightNo, gateTerminal);
                await flightService.changeGateRemote(flightNo, gateTerminal);

                if (!flight) {
                    setConfirmGateChange(false);
                    // setPassenger(undefined);

                    return setOutcomeHelper('error', "Flight not found", setOutcome);
                }

                const selectedFlight = selectedRow?.flight;
                const oldGate = selectedRow?.terminal + '-' + selectedRow?.gate;
                const chosenGate = newGate?.terminal + '-' + newGate?.gate;

                setOutcomeHelper('success', `Flight ${selectedFlight} gate changed from: ${oldGate} to ${chosenGate}`, setOutcome);

                // Notify Ground Staff via MessageBoard
                const alertMsg = {
                    role: RoleEnum.GROUND as UserRole,
                    msg: {
                        message: "Gate Change Notice:\n" +
                            `Flight ${selectedFlight} moved from ${oldGate} to ${chosenGate}.` +
                            "All future bags must be routed to the new gate.\n",
                        to: RoleEnum.GROUND as UserRole,
                        fromRole: user?.role,
                        airline: user?.airline,
                        fromUsername: user?.username,
                    } as MessageBoard
                };

                // Remote
                const res = await messageBoardService.postRemote(alertMsg);
                // Local
                messageBoardService.post({...alertMsg, serverId: res.id});

                setConfirmGateChange(false);
            } catch (err) {
                setOutcomeHelper('error', err instanceof Error ? err.message : "Flight not found", setOutcome);
                setConfirmGateChange(false);
                // setPassenger(undefined);
            }
        }
    }

    if (loading) return <FullScreenLoader/>

    return (
        <RoleGuard allowedRoles={[RoleEnum.GATE]}>
            <PageTitleUpdater/>

            <UITable<GateFlightRow>
                title='Gate Information'
                name={toTitleCase(user?.lastName ?? 'Staff') + (user?.workMode ? ' at GATE: ' + user.workMode : '')}
                columns={columns}
                topAlignment='justify'
                rows={(Array.isArray(flightRows) ? flightRows : []).map((f: Flight) => (
                    {
                        gate: f.gate,
                        terminal: f.terminal,
                        airline: f.airlineName,
                        flight: f.flightNumber,
                        // destination: toTitleCase(f.destination),
                        // departure: formatTime(f.departureTime),
                        // passengers: f.tickets.length ?? 0,
                        // update: "Board Passenger",
                        // action: "Change Gate",
                    }
                )) as GateFlightRow[]}
                onStatusCallback={(row: GateFlightRow) => {router.push(`/dashboard/gate/onboard?board_passenger=true`)}}
                onActionCallback={(row: GateFlightRow) => {
                    console.log('Set Change Gate', row.flight);
                    setShowGateChange(true);
                    setSelectedRow(row);
                }}
            />

            {/*Confirm Departure Dialog*/}
            {confirmDeparture && (<ConfirmDepartureDialog
                open={confirmDeparture}
                flight={flightRows[0]}
                user={user}
                onClose={() => setConfirmDeparture(false)}
            />)}

            {/*Change Passenger Gate Info Dialog*/}
            {showGateChange && (<ChangeGateDialog
                open={showGateChange}
                selectedFlight={selectedRow?.flight as string}
                oldGate={selectedRow?.terminal + '-' + selectedRow?.gate}
                oldDestination={selectedRow?.destination as string}
                outcome={outcome}
                setOutcome={setOutcome}
                onClose={() => setShowGateChange(false)}
                onChangeGate={(row) => {
                    setConfirmGateChange(true);
                    setNewGate(row);
                }}
            />)}

            {/*Confirm Change Gate & Terminal Dialog*/}
            {confirmGateChange && (<ConfirmEntityDialog
                open={confirmGateChange}
                onClose={() => setConfirmGateChange(false)}
                title="Confirm Gate Changes"
                dataId={selectedRow?.flight as string}
                message={
                    <>
                        Are you sure you want to change the gate for Flight<b>{selectedRow?.flight}</b> from:
                        <b style={{color: 'red'}}>{selectedRow?.terminal}-{selectedRow?.gate}</b>
                        to <b style={{color: 'green'}}>{newGate?.terminal}-{newGate?.gate}</b>
                    </>
                }
                onConfirm={handleGateChanges}
            />)}

            {/*Boarding Dialog
            {showBoard && (<BoardDialog
                open={showBoard}
                onClose={() => setShowBoard(false)}
                outcome={outcome}
                setOutcome={setOutcome}
                passenger={passenger}
                onBoard={(row) => {
                    setConfirmBoard(true);
                    setTicketNumber(row);
                }}
            />)}

            Confirm Boarding Dialog
            {confirmBoard && (<ConfirmEntityDialog
                open={confirmBoard}
                onClose={() => setConfirmBoard(false)}
                title="Confirm Boarding"
                dataId={ticketNumber}
                message={
                    <>
                        Confirm boarding for passenger with Ticket<strong>{ticketNumber}</strong>
                    </>
                }
                onConfirm={handleBoarding}
            />)}*/}
        </RoleGuard>
    )
}

export default GateStaffDashboard

/*

    // Onboarding
    const handleBoarding = (proceed: boolean) => {
        if (proceed) {
            try {
                const passenger = passengerService.board(ticketNumber);
                if (!passenger) {
                    setConfirmBoard(false);
                    setPassenger(undefined);
                    return setOutcomeHelper('error', "Passenger not found or not checked-in", setOutcome);
                }

                setOutcomeHelper('success', "Passenger onboard", setOutcome);
                setPassenger(passenger);

                setConfirmBoard(false);
                setTicketNumber('');
            } catch (err) {
                setOutcomeHelper('error', err instanceof Error ? err.message : "Passenger must be checked in", setOutcome);
                setConfirmBoard(false);
                setPassenger(undefined);
            }
        }
    }*/
