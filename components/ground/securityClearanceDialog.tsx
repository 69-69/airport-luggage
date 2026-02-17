'use client';

import * as React from 'react';
import {
    Alert,
    Typography,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {AutocompleteDropdown} from "@/components/dropdown";
import {clearErrorAndSetString, clearOutcomeErrorString, OutcomeProps} from "@/utils/util";
import {passengerService} from "@/actions/services/passengerService";
import {BagLocationEnum, PassengerStatusEnum, SendResult} from "@/types/models";
import {bagService} from "@/actions/services/bagService";
import {DataRow} from "@/types/dataRow";
import {postMessage} from "@/actions/endpoints";
import MessageDialog from "@/components/postMessageDialog";

interface ClearanceDialogProps {
    open: boolean;
    onClose: () => void;
    gate?: string;
    terminal?: string;
    reloadData: () => void;
    selectedRow: DataRow | undefined;
    // isSecurityViolation: (status: boolean) => void;
}

const ClearanceDialog = ({
                             open,
                             onClose,
                             gate,
                             terminal,
                             reloadData,
                             selectedRow,
                             // isSecurityViolation,
                         }: ClearanceDialogProps) => {

    const [status, setStatus] = React.useState('');
    const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [openMsgDialog, setOpenMsgDialog] = React.useState<boolean>(false);
    // const [error, setError] = React.useState<string | null>(null);


    /// Update Bag Location/Status
    const onUpdateStatus = () => {
        if (!selectedRow?.bagId || !selectedRow?.ticket) return;

        console.log('proceed', selectedRow.bagId || selectedRow.ticket);

        if(!status || status.length < 3){
            return setOutcome({status: 'error', message: 'Select the new status of the bag'});
        }

        // Validation: Ensure passenger is boarded
        const passenger = passengerService.findByTicket(selectedRow.ticket.toString());
        if (!passenger) {
            return setOutcome({
                status: 'error',
                message: `Cannot process bag ${selectedRow.bagId}: Passenger not found.`,
            });
        }

        try {
            // Only checked-in passengers can have bags processed for security / clearance
            if (passenger.status !== PassengerStatusEnum.CHECKED_IN) {
                return setOutcome({
                    status: 'error',
                    message: `Cannot process bag ${selectedRow.bagId}: Passenger is not checked-in.`,
                });
            }

            if (status === 'CLEARED') {
                bagService.moveTo(selectedRow.bagId.toString(), BagLocationEnum.GATE);

                reloadData();
                return setOutcome({
                    status: 'success',
                    message: `Bag cleared and moved to Gate ${terminal+'-'+gate?.toUpperCase()}`,
                });
            }

            if (status === 'SECURITY_VIOLATION') {
                reloadData();
                /// Notify Airline Staffs
                onClose();
                setOpenMsgDialog(true);

                return setOutcome({
                    status: 'warning',
                    message: `Security violation, Airline staff must be notified.`,
                });
            }

            bagService.moveTo(selectedRow.bagId.toString(), BagLocationEnum.SECURITY_CHECK);
            reloadData();

            return setOutcome({status: 'success', message: `Bags queued for security checks`,});

        } catch (err) {
            return setOutcome({
                status: 'error',
                message: `Failed to cleared bags: ${err instanceof Error ? err.message : 'Failed to cleared bags'}`
            });
        }
    }


    const handlePostMessage = (row: DataRow) => {
        const result: SendResult = postMessage(row);

        if (result.success) {
            setOutcome({status: 'success', message: 'Security violation reported. Airline staff notified',});
            console.log("Message sent!");
        } else {
            setOutcome({status: 'error', message: result.error ?? 'Could not sent message'});
            console.log(result.error);
        }
    };


    return (
        <>
            <UiDialog
            open={open}
            onCancel={onClose}
            title="Security Status"
            onConfirm={onUpdateStatus}
            cancelLabel={'Cancel'}
            confirmDisabled={!status}
            confirmLabel={'Yes Confirm'}
            content={
                <>
                    <Typography variant="body1" gutterBottom>
                        Please confirm the change in security status for the bag with ID: <b>{selectedRow?.bagId}.</b>
                    </Typography>

                    <AutocompleteDropdown
                        label="Security Status"
                        data={[' ', 'SECURITY_VIOLATION', 'SECURITY_CHECK', 'CLEARED']}
                        value={status}
                        onChange={clearOutcomeErrorString(setStatus, setOutcome)}
                    />

                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>{outcome.message}</Alert>
                    )}
                </>
            }/>

            <MessageDialog
                open={openMsgDialog}
                isSecurityViolation={status === 'SECURITY_VIOLATION'}
                outcome={outcome}
                setOutcome={setOutcome}
                onClose={() => setOpenMsgDialog(false)}
                onPost={handlePostMessage}
            />
        </>
    );
}

export default ClearanceDialog;

