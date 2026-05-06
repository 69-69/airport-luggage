'use client';
import * as React from 'react';
import {
    Alert,
    Typography,
} from '@mui/material';
import Info from "@mui/icons-material/Info";
import UiDialog from "@/components/uiDialog";
import {passengerService} from "@/actions/services/passengerService";
import {
    AuthUser,
    BagLocationEnum,
    Flight,
    MessageBoard,
    PassengerStatusEnum,
    UserRole
} from "@/types/models";
import {bagService} from "@/actions/services/bagService";
import {messageBoardService} from "@/actions/services/messageBoardService";
import {RoleEnum} from "@/types/userRole";
import {useEffect, useState} from "react";
import {OutcomeProps} from "@/utils/util";
import {setOutcomeHelper} from "@/utils/validators";


interface ConfirmDepartureDialogProps {
    open: boolean;
    onClose: () => void;
    flight: Flight;
    user: AuthUser | null;
}

const ConfirmDepartureDialog = ({
                                    open,
                                    onClose,
                                    flight,
                                    user,
                                }: ConfirmDepartureDialogProps) => {
    const [outcome, setOutcome] = useState<OutcomeProps>();
    const [allBoarded, setAllBoarded] = useState<boolean>();
    const [allLoaded, setAllLoaded] = useState<boolean>();
    const [unboardedTotal, setUnboardedTotal] = useState<number>(0);

    const getFlightStatus = (flight: Flight) => {
        const passengers = passengerService.findByFlightNumber(flight.flightNumber);
        const boardedCount = passengers.filter(p => p.status === PassengerStatusEnum.BOARDED).length;
        const unboardedCount = passengers.length - boardedCount;
        const allBoarded = unboardedCount === 0;

        const allBags = bagService.getAllByTickets(flight.tickets);
        const allBagsLoaded = allBags.length > 0 && allBags.every(b => b.location === BagLocationEnum.LOADED);

        return {unboardedCount, allBoarded, allBagsLoaded};
    };

    useEffect(() => {
        if (flight) {
            const {unboardedCount, allBoarded, allBagsLoaded} = getFlightStatus(flight);
            setUnboardedTotal(unboardedCount);
            setAllBoarded(allBoarded);
            setAllLoaded(allBagsLoaded);
        }
    }, [flight]);

    const handleSubmit = async () => {
        if (!flight?.flightNumber || !user) return;

        const {unboardedCount, allBoarded, allBagsLoaded} = getFlightStatus(flight);

        setUnboardedTotal(unboardedCount);
        setAllBoarded(allBoarded);
        setAllLoaded(allBagsLoaded);

        if (!allBoarded) return setOutcomeHelper('error', "Not all passengers are boarded", setOutcome);
        if (!allBagsLoaded) return setOutcomeHelper('error', "Not all bags are loaded", setOutcome);

        // Notify Admin via MessageBoard
        const alertMsg = {
            role: user?.role,
            msg: {
                message: `Departure Notice:\nFlight ${flight.flightNumber} is ready for departure.`,
                to: RoleEnum.ADMIN as UserRole,
                fromRole: user?.role,
                airline: user?.airline,
                fromUsername: user?.username
            } as MessageBoard
        };

        // Remote
        const res = await messageBoardService.postRemote(alertMsg);
        // Local
        messageBoardService.post({...alertMsg, serverId: res.id});

        setOutcomeHelper('success', "Administrator has been notified. Awaiting approval", setOutcome);
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Confirm Departure"
            cancelLabel='Cancel'
            confirmLabel='Notify Administrator'
            confirmDisabled={!flight || !user || !allLoaded || !allBoarded}
            onConfirm={handleSubmit}
            content={
                <>
                    <Typography
                        id="confirm-dialog-description"
                        sx={{textDecorationLine: 'underline', display: 'flex', alignItems: 'center', gap: 1}}
                    >
                        <Info fontSize="small"/>
                        Confirm all passengers and their baggage are onboard
                    </Typography>
                    {
                        flight && (
                            <Typography sx={{mt: 2}}>
                                [ <b>Flight:</b> {flight.flightNumber} ]<br/><br/>
                                {
                                    allBoarded ? '+ All passengers boarded!' : '- '+unboardedTotal + ' more passenger(s) not yet onboard!'
                                }<br/>
                                {
                                    allLoaded ? '+ All bags loaded!' : '- Some bags are not loaded!'

                                }<br/>
                            </Typography>
                        )
                    }
                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>{outcome.message}</Alert>
                    )}
                </>
            }/>
    );
}

export default ConfirmDepartureDialog;

/*const handleSubmit2 = () => {
        if (!flight?.flightNumber) {
            return setOutcomeHelper('error', "No flight available for departure", setOutcome);
        }

        const passengers = passengerService.findByFlightNumber(flight.flightNumber);

        if (!passengers.length) {
            return setOutcomeHelper('error', "No passengers available for departure", setOutcome);
        }

        const boardedCount = passengers.filter(
            p => p.status === PassengerStatusEnum.BOARDED
        ).length;
        console.log('boarded-Count', passengers.length, boardedCount);

        const unboardedCount = passengers.length - boardedCount;
        const allPassengersBoarded = unboardedCount === 0;

        setUnboardedTotal(unboardedCount);
        setAllBoarded(allPassengersBoarded);

        if (!allPassengersBoarded) {
            return setOutcomeHelper('error', "Not all passengers are boarded", setOutcome);
        }

        const allBags = bagService.getAllByTickets(flight.tickets);

        if (!allBags.length) {
            return setOutcomeHelper('error', "No bags available for departure", setOutcome);
        }

        const allBagsLoaded = allBags.every(
            (b) => b.location === BagLocationEnum.LOADED
        );

        setAllLoaded(allBagsLoaded);

        if (!allBagsLoaded) {
            return setOutcomeHelper('error', "Not all bags are loaded", setOutcome);
        }

        if (!user) return;

        // Notify Admin via MessageBoard
        messageBoardService.post({
            role: user?.role,
            msg: {
                message: `Departure Notice:\nFlight ${flight.flightNumber} is ready for departure.`,
                to: RoleEnum.ADMIN as UserRole,
                fromRole: user?.role,
                airline: user?.airline,
            } as MessageBoard
        });

// alert(".");
setOutcomeHelper('success', "Administrator has been notified. Awaiting approval", setOutcome);

// onClose();
};*/

