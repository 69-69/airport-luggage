'use client';

import React, {useEffect} from "react";
import UITable from "@/components/uiTable";
import {Button} from "@mui/material";
import ConfirmEntityDialog from "@/components/confirmEntityDialog";
import {addStaff} from "@/actions/endpoints";
import {DataRow} from "@/types/dataRow";
import AddStaffDialog from "@/components/admin/addStaffDialog";
import {formatAirline, OutcomeProps, toTitleCase} from "@/utils/util";
import {SendResult, User} from "@/types/models";
import {userService} from "@/actions/services/userService";
import {RoleEnum} from "@/types/userRole";
import PageTitleUpdater from "@/components/pageTitleUpdater";
import RoleGuard from "@/actions/roleGuard";

interface StaffRow extends DataRow {
    name: string;
    role: string;
    airline: string;
    action: string;
}

const columns = ["name", "role", 'phone', "Airline", "action"];

const Staffs = () => {
    const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [selectedRow, setSelectedRow] = React.useState<DataRow>();
    const [isConfirm, setConfirm] = React.useState(false);
    const [isAdd, setIsAdd] = React.useState(false);
    const [staffRows, setStaffRows] = React.useState<User[]>([]);

    // Fetch staff list
    const fetchStaffs = () => {
        try {
            const res: User[] = userService.getAll();
            setStaffRows(res);
        } catch (e) {
            console.error("Error fetching staff rows:", e);
        }
    };

    // Initial fetch
    useEffect(() => fetchStaffs(), []);

    const handleOnRemove = async (proceed: boolean) => {
        console.log('proceed', proceed);

        if (proceed && selectedRow?.phone !== null) {
            userService.remove(selectedRow?.phone as string);
            await userService.removeRemote(selectedRow?.phone as string);

            fetchStaffs();
            setConfirm(false); // UI state stays on client
        }
    };


    const handleAddStaff = async (row: DataRow) => {
        const res: SendResult = await addStaff(row);

        if (res.success) {
            fetchStaffs(); // Refresh table after adding
            setOutcome({status: 'success', message: 'Staff added and email sent successfully',});
            console.log("Staff added!"); // Executes immediately
            // Clear the outcome
            setOutcome(undefined);
        } else {
            setOutcome({status: 'error', message: res.error ?? ''});
            console.log(res.error); // Executes immediately
        }
    };

    return (
        <RoleGuard allowedRoles={[RoleEnum.ADMIN]}>
            <PageTitleUpdater />
            <UITable<StaffRow>
                columns={columns}
                rows={(Array.isArray(staffRows) ? staffRows : []).map(staff => ({
                    name: toTitleCase(staff.firstName + " " + staff.lastName),
                    role: staff.role.toUpperCase(),
                    phone: staff.phone,
                    airline: formatAirline(staff.airline ?? "N/A"),
                    action: "Remove",
                } as StaffRow))}
                title="Staff Management"
                topButton={
                    <Button variant="outlined" sx={{textTransform: 'none'}} onClick={() => setIsAdd(true)}>
                        Add Staff
                    </Button>
                }
                onActionCallback={(row: StaffRow) => {
                    console.log('row', row.airline);
                    setSelectedRow(row);
                    setConfirm(true);
                }}
            />
            <ConfirmEntityDialog
                open={isConfirm}
                onClose={() => setConfirm(false)}
                title="Remove Staff"
                dataId={selectedRow?.phone as string}
                message={
                    <>
                        Are you sure you want to remove staff<b>{selectedRow?.name}</b>account? This action cannot be
                        undone.
                    </>
                }
                onConfirm={handleOnRemove}
            />
            <AddStaffDialog
                open={isAdd}
                outcome={outcome}
                setOutcome={setOutcome}
                onClose={() => setIsAdd(false)}
                onAddStaff={handleAddStaff}
            />
        </RoleGuard>
    );
}

export default Staffs;

/*const rows: StaffRow[] = [
    {
        name: "Mary M.",
        role: "Gate",
        airline: "AA",
        action: "Remove",
    },
    {
        name: "IP Man",
        role: "Airline",
        airline: "UA",
        action: "Remove",
    },
    {
        name: "Hassan A",
        airline: "SA",
        role: "Ground",
        action: "Remove",
    }
];*/
