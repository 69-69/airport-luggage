'use client';

import React, {useEffect, useState} from "react";
import UITable from "@/components/uiTable";
import {Button, Typography} from "@mui/material";
import ConfirmEntityDialog from "@/components/confirmEntityDialog";
import AddPassengerDialog from "@/components/admin/addPassengerDialog";
import {DataRow} from "@/types/dataRow";
import {toTitleCase} from "@/utils/util";
import {Passenger} from "@/types/models";
import {passengerService} from "@/actions/services/passengerService";
import {bagService} from "@/actions/services/bagService";
import {RoleEnum} from "@/types/userRole";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import RoleGuard from "@/actions/roleGuard";
import {flightService} from "@/actions/services/flightService";
import AssignFlightToDialog from "@/components/admin/updatePassengerDialog";
import {useRouter} from "next/navigation";
import PassengerBagsDialog from "@/components/admin/passengerBags";

interface PassengerRow extends DataRow {
    name: string;
    id: string;
    flight: string;
    ticket: string;
    status: string;
    bags: number;
    view: string;
    update: string;
    action: string;
}

const columns = ["name", "id", "ticket", "flight", "status", "bags", "view", "update", "action"];

const Passengers = () => {
    // const router = useRouter();
    const [error, setError] = React.useState('');
    const [isConfirm, setConfirm] = useState(false);
    const [isShowBags, setShowBags] = useState(false);
    const [selectedRow, setSelectedRow] = useState<DataRow>();
    const [isAdd, setIsAdd] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [passengerRows, setPassengerRows] = useState<Passenger[]>([]);

    // Fetch Passenger list
    const fetchPassengers = () => {
        try {
            const res: Passenger[] = passengerService.getAll();

            console.log('Before: Fetched passenger data:', res);
            setPassengerRows(res);
        } catch (e) {
            console.error("Error fetching passenger rows:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchPassengers(), []);

    const handleOnRemove = async (proceed: boolean) => {
        if (!proceed || !selectedRow?.ticket) return;

        try {
            const ticket = selectedRow.ticket as string;
            const flightNumber = selectedRow.flight as string;

            // Validate flight/ticket relation first
            flightService.removeTicket(flightNumber, ticket);

            // Then delete dependent data
            passengerService.remove(ticket);
            bagService.removeAll(ticket);
            await passengerService.removeRemote(ticket);

            fetchPassengers();
            setConfirm(false);

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Something went wrong');
            }
        }
    };

    return (
        <RoleGuard allowedRoles={[RoleEnum.ADMIN]}>
            <PageTitleUpdater/>
            <UITable<PassengerRow>
                columns={columns}
                rows={(Array.isArray(passengerRows) ? passengerRows : []).map(p => ({
                    name: toTitleCase(`${p.firstName} ${p.lastName}`),
                    id: p.idNumber,
                    flight: p.flightNumber,
                    ticket: p.ticketNumber,
                    status: p.status,
                    bags: bagService.getBagsByTicket(p.ticketNumber),
                    view: "See bags",
                    update: "Update",
                    action: "Remove",
                }))}
                title="Passenger Management"
                topButton={
                    <>
                        <Button variant="outlined" sx={{textTransform: 'none'}} onClick={() => setIsAdd(true)}>
                            Add Passenger
                        </Button>
                        {error && (
                            <Typography color="error" variant="body2" sx={{mb: 1}}>
                                {error}
                            </Typography>
                        )}
                    </>
                }
                onActionCallback={(row: PassengerRow) => {
                    console.log('row', row.flight);
                    setSelectedRow(row);
                    setConfirm(true);
                }}
                onOptCallback={(row: PassengerRow) =>{
                    setSelectedRow(row);
                    setShowBags(true);
                }}

                onStatusCallback={(row: PassengerRow) => {
                    console.log('row-all', row);
                    setSelectedRow(row);
                    setShowUpdate(true);
                }}
            />
            <ConfirmEntityDialog
                open={isConfirm}
                onClose={() => setConfirm(false)}
                title="Remove passenger"
                dataId={selectedRow?.ticket as string}
                message={
                    <>
                        Are you sure you want to remove passenger<b>{selectedRow?.name}</b>from
                        flight<b>{selectedRow?.flight}</b>.This action cannot be undone.
                    </>
                }
                onConfirm={handleOnRemove}
            />
            <AddPassengerDialog
                open={isAdd}
                onClose={() => setIsAdd(false)}
                refreshPassengers={fetchPassengers}
                // outcome={outcome}
                // setOutcome={setOutcome}
                // onAddPassenger={handleAddPassenger}
            />
            <AssignFlightToDialog
                open={showUpdate}
                ticketNumber={selectedRow?.ticket as string}
                onClose={() => setShowUpdate(false)}
                refreshPassengers={fetchPassengers}
                // outcome={outcome}
                // setOutcome={setOutcome}
                // onAddPassenger={handleAddPassenger}
            />

            {/*PassengerBags Dialog*/}
            {isShowBags && (<PassengerBagsDialog
                open={isShowBags}
                ticket={selectedRow?.ticket as string}
                fullname={selectedRow?.name as string}
                onClose={() => setShowBags(false)}
            />)}
        </RoleGuard>
    );
}

export default Passengers;


/*
const handleAddPassenger = (row: DataRow) => {
    const result: SendResult = addPassenger(row);

    if (result.success) {
        fetchPassengers();
        setOutcome({status: 'success', message: 'Passenger added successfully',});
        console.log("Passenger added!");
    } else {
        setOutcome({status: 'error', message: result.error ?? ''});
        console.log(result.error);
    }
};

const rows: PassengerRow[] = [
    {
        name: "Mary M.",
        flight: "AA3245",
        ticket: "7352841936",
        status: "Boarded",
        action: "Remove",
    },
    {
        name: "IP Man",
        flight: "UA9868",
        ticket: "1234432123",
        status: "Checked-in",
        action: "Remove",
    },
    {
        name: "Hassan A",
        flight: "SA1234",
        ticket: "9876543212",
        status: "Not-Checked-in",
        action: "Remove",
    }
];*/
