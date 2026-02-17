'use client';

import React, {useEffect} from "react";
import UITable from "@/components/uiTable";
import {Button} from "@mui/material";
import ConfirmEntityDialog from "@/components/confirmEntityDialog";
import AddFlightDialog from "@/components/admin/addFlightDialog";
import {DataRow} from "@/types/dataRow";
import {formatAirline, toTitleCase} from "@/utils/util";
import {Flight} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {useRouter} from "next/navigation";
import {RoleEnum} from "@/types/userRole";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import RoleGuard from "@/actions/roleGuard";
import {formatTime} from "@/utils/validators";

interface FlightRow extends DataRow {
    flight: string;
    airline: string;
    terminal: string;
    gate: string;
    destination: string;
    departure: string;
    passengers: number;
    status: string;
    action: string;
}

const columns = ["flight", "airline", "terminal", "gate", "destination", "departure", "passengers", "status", "action"];

const Flights = () => {
    const router = useRouter();
    const [error, setError] = React.useState('');
    // const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [isConfirm, setConfirm] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<DataRow>();
    const [isAdd, setIsAdd] = React.useState(false);
    const [flightRows, setFlightRows] = React.useState<Flight[]>([]);

    // Fetch Flight list
    const fetchFlights = () => {
        try {
            const res: Flight[] = flightService.getAll();
            setFlightRows(res);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchFlights(), []);

    const handleOnRemove = (proceed: boolean) => {
        try {
            if (proceed && selectedRow?.flight !== null) {
                flightService.remove(selectedRow?.flight as string);

                // Refresh flight list after removal
                fetchFlights();

                // Close confirmation UI
                setConfirm(false);
            }
        } catch (err: unknown) {
            // Safely extract error message
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            console.error("Failed to remove flight:", err);
        }
    };

    return (
        <RoleGuard allowedRoles={[RoleEnum.ADMIN]}>
            <PageTitleUpdater/>
            <UITable<FlightRow>
                columns={columns}
                rows={(Array.isArray(flightRows) ? flightRows : []).map((f: Flight) => ({
                    flight: f.flightNumber.toUpperCase(),
                    airline: formatAirline(f.airlineName),
                    terminal: f.terminal.toUpperCase(),
                    gate: f.gate.toUpperCase(),
                    destination: toTitleCase(f?.destination),
                    departure: formatTime(f?.departureTime),
                    passengers: f?.tickets.length ?? 0,
                    status: "Manifest",
                    action: "Remove",
                }))}
                title="Flight Management"
                topButton={
                    <Button variant="outlined" sx={{textTransform: 'none'}} onClick={() => setIsAdd(true)}>
                        Add Flight
                    </Button>
                }
                onStatusCallback={(row: FlightRow) => router.push(`/dashboard/airline/${row.flight}`)}
                onActionCallback={(row: FlightRow) => {
                    console.log('flight--Number', row.flight);
                    setSelectedRow(row);
                    setConfirm(true);
                }}
            />

            {/*Add Flight form Dialog*/}
            {isAdd && (<AddFlightDialog
                open={isAdd}
                refreshFlights={fetchFlights}
                onClose={() => setIsAdd(false)}
                // outcome={outcome}
                // setOutcome={setOutcome}
                // onAddFlight={handleAddFlight}
            />)}

            {/*Confirm Flight removal Dialog*/}
            <ConfirmEntityDialog
                open={isConfirm}
                onClose={() => setConfirm(false)}
                title="Remove Flight"
                dataId={selectedRow?.flight as string}
                errored={error}
                message={
                    <>
                        Are you sure you want to remove Flight<b>{selectedRow?.flight}</b>from the system?
                    </>
                }
                onConfirm={handleOnRemove}
            />

        </RoleGuard>
    );
}

export default Flights;

/*const handleAddFlight = (row: DataRow) => {
        const result: SendResult = addFlight(row);

        if (result.success) {
            setOutcome({status: 'success', message: 'Flight added successfully',});
            fetchFlights();
            console.log("Flight added!");
        } else {
            setOutcome({status: 'error', message: result.error ?? ''});
            console.log('Flight', result.error);
        }
    };

    const rows: FlightRow[] = [
    {
        airlineName: "AA",
        flightNumber: "AA3245",
        terminal: "T2",
        gate: "G5",
        action: "Remove",
    },
    {
        airlineName: "UA",
        flightNumber: "UA9868",
        terminal: "T9",
        gate: "G9",
        action: "Remove",
    },
    {
        airlineName: "SA",
        flightNumber: "SA1234",
        terminal: "T7",
        gate: "G4",
        action: "Remove",
    }
];*/
