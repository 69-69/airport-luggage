'use client';

import React, {useEffect} from "react";
import UITable from "@/components/uiTable";
import {Box, Typography} from "@mui/material";
import {DataRow} from "@/types/dataRow";
import {useParams} from "next/navigation";
import {Passenger} from "@/types/models";
import {passengerService} from "@/actions/services/passengerService";
import {toTitleCase} from "@/utils/util";
import {RoleEnum} from "@/types/userRole";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import RoleGuard from "@/actions/roleGuard";

interface CheckInRow extends DataRow {
    name: string;
    flight:string;
    ticket:string;
    idNumber: string;
    status: string;
}

const columns = ["name", "flight", "ticket", "id number", "status"];

const CheckInsTable = () => {
    const params = useParams();
    const flightNumber = params?.flight_id as string;

    const [manifests, setManifests] = React.useState<Passenger[]>([]);

    useEffect(() => {
        if (!flightNumber) return;
        const res: Passenger[] = passengerService.findByFlightNumber(flightNumber);
        setManifests(res);

    }, [flightNumber]); // dependency array


    return (
        <RoleGuard allowedRoles={[RoleEnum.AIRLINE, RoleEnum.ADMIN]}>
            <PageTitleUpdater />
            {/*<Box component="section" sx={{p: 2, ml: {md: 30}, width: {xs: '100%', sm: '80%', md: '80%',}}}>*/}

            <UITable<CheckInRow>
                title='Passenger Manifest'
                topAlignment='center'
                columns={columns}
                rows={(Array.isArray(manifests) ? manifests : []).map((m) => (
                    {
                        name: toTitleCase(m.firstName +' '+m.lastName),
                        flight: m.flightNumber.toUpperCase(),
                        ticket: m.ticketNumber,
                        idNumber: m.idNumber,
                        status: m.status.toUpperCase(),
                        // action: "Remove",
                    }
                ))}
                topButton={
                    <Typography variant="h6" sx={{fontWeight: 'normal'}} gutterBottom>
                        [ Flight: <b>{flightNumber.toUpperCase()}</b> ]
                    </Typography>
                }
                /*onActionCallback={(row) => {
                    setSelectedRow(row);
                    setConfirm(true);
                }}*/
            />
            {/*<ConfirmEntityDialog
                open={isConfirm}
                onClose={() => setConfirm(false)}
                title="Undo Check-in"
                dataId={flightNumber}
                message={
                    <>
                        This will remove<strong>{selectedRow?.name}</strong> from the check-in list for
                        flight<strong>{selectedRow?.flight}.</strong> Do you want to continue?
                    </>
                }
                onRemove={handleOnRemove}
            />*/}
            {/*</Box>*/}
        </RoleGuard>
    );
}

export default CheckInsTable;
