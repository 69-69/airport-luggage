'use client';

import * as React from 'react';
import UiDialog from "@/components/uiDialog";
import {Bag} from "@/types/models";
import {bagService} from "@/actions/services/bagService";
import {useEffect, useState} from "react";
import {toTitleCase} from "@/utils/util";
import UITable from "@/components/uiTable";
import {DataRow} from "@/types/dataRow";

interface CheckInDialogProps {
    open: boolean;
    onClose: () => void;
    ticket: string;
    fullname: string;
}

interface BagRow extends DataRow {
    id: string;
    weight: number;
    ticket: string;
    location: string;
    action: string;
}

const PassengerBagsDialog = ({
                                 ticket,
                                 open,
                                 onClose,
                                 fullname,
                             }: CheckInDialogProps) => {

    const [bags, setBags] = useState<Bag[]>([]);

    const fetchBags = () => {
        try {
            const res = bagService.getBagsByPassengerTicket(ticket);
            console.log("Fetched bags:", res);
            setBags(res);
        } catch (e) {
            console.error("Error fetching bags:", e);
        }
    };

    useEffect(() => {
        if (ticket) {
            fetchBags();
        }
    }, [ticket]);

    const handleRemoveBag = async (id: string, ticket?: string) =>{
        bagService.removeById(id);
        await bagService.removeRemote(id);
        fetchBags();
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title={fullname+" Bag(s)"}
            cancelLabel="Cancel"
            confirmLabel='Done'
            content={
                <UITable<BagRow>
                    columns={['id', 'location', 'ticket', 'weight', 'action']}
                    rows={(Array.isArray(bags) ? bags : []).map(p => ({
                        id: p.bagId,
                        location: p.location as string,
                        ticket: p.ticketNumber,
                        weight: p.weight + " kg",
                        action: "Remove",
                    }))}
                    onActionCallback={ (row: BagRow) => {
                        handleRemoveBag(row.id as string, row.ticket as string).then(r => console.log(r+' deleted'));
                    }}
                    // title="Passenger Management"
                />
            }
        />
    );
};

export default PassengerBagsDialog;