'use client';

import React, {useEffect, useState} from "react";
import UITable from "@/components/uiTable";
import {Typography} from "@mui/material";
import {DataRow} from "@/types/dataRow";
import {RoleEnum} from "@/types/userRole";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import RoleGuard from "@/actions/roleGuard";
import {Passenger, PassengerStatusEnum} from "@/types/models";
import {passengerService} from "@/actions/services/passengerService";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";
import {flightService} from "@/actions/services/flightService";
import {toTitleCase} from "@/utils/util";

interface OnBoardRow extends DataRow {
    name: string;
    flight: string;
    ticket: string;
    status: string;
    // action: string;
}

const OnBoardTable = () => {
    const {user, loading} = useAuth();

    if (loading) {
        return <FullScreenLoader/>
    }

    const [passengersRows, setPassengersRows] = useState<Passenger[]>([]);

    // Fetch Passenger list
    const fetchPassengers = () => {
        try {
            if (!user?.airline || !user?.workMode) return;

            const airlineCode = user.airline.split(" - ")[0];

            const flight = flightService.findByAirlineCodeAndGate(airlineCode, user.workMode);

            if (!flight) return;

            const res: Passenger[] = passengerService.findByFlightNumber(flight?.flightNumber)
                .filter((p: Passenger) => p.status === PassengerStatusEnum.BOARDED);
            setPassengersRows(res);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchPassengers(), [user]);

    return (
        <RoleGuard allowedRoles={[RoleEnum.GATE]}>
            <PageTitleUpdater/>
            <UITable<OnBoardRow>
                columns={["name", "flight", "ticket", "status"]}
                rows={(Array.isArray(passengersRows) ? passengersRows : []).map(p => (
                    {
                        name: toTitleCase(p.firstName + " " + p.lastName),
                        flight: p.flightNumber,
                        ticket: p.ticketNumber,
                        status: p.status as string,
                        // action: "Remove",
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
                    // setSelectedRow(row);
                    // setConfirm(true);
                }}
            />
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
            />*/}
        </RoleGuard>
    );
}

export default OnBoardTable;
