'use client';

import React, {useEffect} from "react";
import UITable from "@/components/uiTable";
import {Box, Button} from "@mui/material";
import ConfirmEntityDialog from "@/components/confirmEntityDialog";
import {postMessage} from "@/actions/endpoints";
import {DataRow} from "@/types/dataRow";
import MessageDialog from "@/components/postMessageDialog";
import {OutcomeProps, toSentenceCase, toTitleCase} from "@/utils/util";
import {MessageBoard, SendResult, UserRole} from "@/types/models";
import {messageBoardService} from "@/actions/services/messageBoardService";
import {formatTime} from "@/utils/validators";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";
import {RoleEnum} from "@/types/userRole";
import RoleGuard from "@/actions/roleGuard";
import PageTitleUpdater from "@/components/pageTitleUpdater";

interface MessageRow extends DataRow {
    id: string;
    message: React.ReactNode;
    department: string;
    airline: string;
    status: string;
    action: string;
}

const columns = ["message", "department", "airline", "status", "action"];

const MessageBoardTable = () => {
    const {user, loading} = useAuth();

    const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [openMsgDialog, setOpenMsgDialog] = React.useState<boolean>(false);
    const [selectedRow, setSelectedRow] = React.useState<MessageRow>();
    const [messages, setMessages] = React.useState<MessageBoard[]>([]);
    const [isConfirm, setConfirm] = React.useState<boolean>(false);

    if (loading) return <FullScreenLoader/>

    /*const params = useParams();
    const flight_id = params?.flight_id as string;*/


    // Fetch Messages list
    const fetchMessages = () => {
        try {
            const isAdmin = user?.role == (RoleEnum.ADMIN as UserRole);

            // Admins see all messages; staff see messages for their role
            const res: MessageBoard[] = isAdmin
                ? messageBoardService.getAllWithRole()
                : messageBoardService.get(user!.role);

            console.log('Fetched messages:', res);
            setMessages(res);
        } catch (e) {
            console.error("Error fetching messages:", e);
        }
    };

    const handleOnRemove = async (proceed: boolean) => {

        if (proceed && selectedRow?.timestamp !== null) {
            const id = selectedRow?.id as string;
            messageBoardService.remove(
                {
                    role: selectedRow?.department as UserRole,
                    id: id
                }
            );
            await messageBoardService.removeRemote(id);
            fetchMessages();
            setConfirm(false); // UI state stays on client
        }
    };

    const handlePostMessage = async (row: DataRow) => {
        const result: SendResult = await postMessage(row);

        if (result.success) {
            fetchMessages();

            setOutcome({status: 'success', message: 'Message sent successfully',});
            console.log("Message sent!");
        } else {
            setOutcome({status: 'error', message: result.error ?? ''});
            console.log(result.error);
        }
    };

    // Initial fetch
    useEffect(() => fetchMessages(), []);

    const formatMessage = (text: string) => {
        const regex = /\b([A-Za-z]{2,}\d{4}|t\d+-g\d+)\b/;

        return text.split(/(\b[A-Za-z]{2,}\d{4}\b|\bt\d+-g\d+\b)/g)
            .map((part, index) =>
                regex.test(part) ? (
                    <strong key={index}>{part.toUpperCase()}</strong>
                ) : (
                    part
                )
            );
    };

    return (
        <RoleGuard allowedRoles={[RoleEnum.ADMIN, RoleEnum.AIRLINE, RoleEnum.GATE, RoleEnum.GROUND]}>
            <PageTitleUpdater/>
            {/*<Box component="section" sx={{p: 2, ml: {md: 30}, width: {xs: '100%', sm: '80%', md: '80%',}}}>*/}

            <UITable<MessageRow>
                align={"left"}
                columns={columns}
                rows={(Array.isArray(messages) ? messages : []).map((msg: MessageBoard) => (
                    {
                        message: <>
                            {formatMessage(toSentenceCase(msg.message))}
                            <br/>
                            <span style={{color: "gray"}}>
                                (from: {toTitleCase(msg.fromRole === user?.role ? "You" : msg.fromRole)})
                                {" @ "} {formatTime(msg.timestamp)}
                            </span>
                        </>,

                        id: msg.id, // uSed but never displayed in the UI
                        isRead: msg.isRead, // uSed but never displayed in the UI
                        department: msg.to?.toUpperCase() ?? 'N/A',
                        airline: msg.airline ? toTitleCase(msg.airline) : 'N/A',
                        status: msg.fromRole === user?.role ? "Sent" : (msg.isRead ? 'Read' : 'Unread'),
                        action: "Delete"
                    }))}
                title='Message Board'
                topButton={
                    <Button variant="outlined" sx={{textTransform: 'none'}} onClick={() => setOpenMsgDialog(true)}>
                        Post Message
                    </Button>
                }
                onStatusCallback={async (row) => {
                    if (row?.status.toLowerCase() !== 'sent') {
                        const msgRole = row?.department as UserRole;
                        const isRead = !row.isRead as boolean;
                        const id = row.id as string;
                        // const msg = row.message as string;

                        messageBoardService.updateReadStatus({role: msgRole, id: id, isRead: isRead});
                        await messageBoardService.updateReadStatusRemote({id: id, isRead: isRead});
                        fetchMessages();
                    }
                }}
                onActionCallback={(row) => {
                    setSelectedRow(row);
                    setConfirm(true);
                }}
            />
            <ConfirmEntityDialog
                open={isConfirm}
                onClose={() => setConfirm(false)}
                title="Delete Message"
                dataId={selectedRow?.id as string}
                message={
                    <>
                        Are you sure you want to delete this message? Once deleted, recipient will no longer be able see
                        it.
                    </>
                }
                onConfirm={handleOnRemove}
            />
            <MessageDialog
                // role={user?.role}
                open={openMsgDialog}
                outcome={outcome}
                setOutcome={setOutcome}
                onClose={() => setOpenMsgDialog(false)}
                onPost={handlePostMessage}
            />
            {/*</Box>*/}
        </RoleGuard>
    );
}

export default MessageBoardTable;

/*const rows: MessageRow[] = [
    {
        message: <><b>[ 05:40 AM ]</b> Security or bag issues visible <b>[ from: Ben ]</b></>,
        id: "123",
        status: 'Read',
        action: "Delete"
    },
    {
        message: <><b>[ 01:40 PM ]</b> Missing passenger bag <b>[ from: Ryan ]</b></>,
        id: "321",
        status: 'Unread',
        action: "Delete"
    },
];*/
