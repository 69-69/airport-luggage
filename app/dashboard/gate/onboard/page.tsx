'use client';

import React, {useEffect, useState} from "react";
import UITable from "@/components/uiTable";
import {Typography} from "@mui/material";
import {DataRow} from "@/types/dataRow";
import {RoleEnum} from "@/types/userRole";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import RoleGuard from "@/actions/roleGuard";
import {FlightStatusEnum, Passenger, PassengerStatusEnum} from "@/types/models";
import {passengerService} from "@/actions/services/passengerService";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";
import {flightService} from "@/actions/services/flightService";
import {OutcomeProps, toTitleCase} from "@/utils/util";
import {useSearchParams} from "next/navigation";
import BoardDialog from "@/components/gate/boardDialog";
import ConfirmEntityDialog from "@/components/confirmEntityDialog";
import {setOutcomeHelper} from "@/utils/validators";

interface OnBoardRow extends DataRow {
    name: string;
    flight: string;
    ticket: string;
    status: string;
    action: string;
}

const OnBoardTable = () => {
    const {user, loading} = useAuth();
    const [passengersRows, setPassengersRows] = useState<Passenger[]>([]);
    const searchParams = useSearchParams();

    // Passenger Boarding
    const [showBoard, setShowBoard] = useState<{ show: boolean, fullName: string, ticketNumber: string }>({
        show: false,
        ticketNumber: '',
        fullName: ''
    });
    const [confirmBoard, setConfirmBoard] = useState(false);
    const [outcome, setOutcome] = useState<OutcomeProps>();
    const [selectedPassenger, setSelectedPassenger] = React.useState<Passenger>();

    if (loading) {
        return <FullScreenLoader/>
    }


    // Fetch Passenger list
    const fetchPassengers = () => {
        try {
            if (!user?.airline || !user?.workMode) return;

            const airlineCode = user.airline.split(" - ")[0];

            const flight = flightService.findByAirlineCodeAndGate(airlineCode, user.workMode);

            if (!flight) return;
            const status =
                (searchParams.get("board_passenger"))?.includes('true') ?
                    PassengerStatusEnum.CHECKED_IN :
                    PassengerStatusEnum.BOARDED;

            const res: Passenger[] =
                passengerService.findByFlightNumber(flight?.flightNumber)
                    .filter(
                        (p: Passenger) => p.status === status
                    );
            setPassengersRows(res);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchPassengers(), [user]);

    // Onboarding
    const handleBoarding = async (proceed: boolean) => {
        if (proceed) {
            try {
                const passenger = passengerService.board(showBoard.ticketNumber);
                await passengerService.boardRemote(showBoard.ticketNumber);
                await flightService.updateStatusRemote(passenger!.flightNumber, FlightStatusEnum.BOARDING);

                if (!passenger) {
                    setConfirmBoard(false);
                    setSelectedPassenger(undefined);
                    return setOutcomeHelper('error', "Passenger not found or not checked-in", setOutcome);
                }

                setOutcomeHelper('success', "Passenger onboard", setOutcome);
                setSelectedPassenger(passenger);

                setConfirmBoard(false);
                setShowBoard({show: true, ticketNumber: '', fullName: ''});
            } catch (err) {
                setOutcomeHelper('error', err instanceof Error ? err.message : "Passenger must be checked in", setOutcome);
                setConfirmBoard(false);
                setSelectedPassenger(undefined);
            }
        }
    }

    return (
        <RoleGuard allowedRoles={[RoleEnum.GATE]}>
            <PageTitleUpdater/>
            <UITable<OnBoardRow>
                columns={["name", "flight", "ticket", "status", "action"]}
                rows={(Array.isArray(passengersRows) ? passengersRows : []).map(p => (
                    {
                        name: toTitleCase(p.firstName + " " + p.lastName),
                        flight: p.flightNumber,
                        ticket: p.ticketNumber,
                        status: p.status as string,
                        action: "Board Passenger",
                    }
                )) as OnBoardRow[]}
                title='Onboard Manifest'
                topAlignment='center'
                topButton={
                    passengersRows.length > 0 ? (
                        <Typography variant="h6" sx={{fontWeight: 'normal'}} gutterBottom>
                            [ Passengers onboard ]
                        </Typography>
                    ) : null
                }
                onActionCallback={(row) => {
                    setShowBoard({ticketNumber: row.ticket, fullName: row.name, show: true});
                    setOutcome(undefined);
                }}
            />

            {/*Boarding Dialog*/}
            {showBoard && (<BoardDialog
                open={showBoard.show}
                onClose={() => setShowBoard({show: false, ticketNumber: '', fullName: ''})}
                outcome={outcome}
                setOutcome={setOutcome}
                passenger={selectedPassenger}
                ticket={showBoard.ticketNumber}
                fullName={showBoard.fullName}
                showConfirmation={() => setConfirmBoard(true)}
            />)}

            {/*Confirm Boarding Dialog*/}
            {confirmBoard && (<ConfirmEntityDialog
                open={confirmBoard}
                onClose={() => setConfirmBoard(false)}
                title="Confirm Boarding"
                dataId={showBoard.ticketNumber}
                message={
                    <>
                        Confirm boarding for passenger with Ticket<strong>{showBoard.ticketNumber}</strong>
                    </>
                }
                onConfirm={handleBoarding}
            />)}
        </RoleGuard>
    );
}

export default OnBoardTable;

{/*<ConfirmEntityDialog
                open={isConfirm}
                onClose={() => setConfirm(false)}
                title="Undo Onboard"
                dataId={flight_id}
                message={
                    <>
                        This will remove<strong>{selectedRow?.name}</strong> from the onboard list for
                        flight<strong>{selectedRow?.flight}.</strong> Do you want to continue?
                    </>
                }
                onRemove={handleOnRemove}
            />*/
}