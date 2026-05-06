'use client';

import * as React from 'react';
// import {v4 as uuidv4} from "uuid";
import {
    Alert, Button, Card, CardContent, Stack, TextField, Typography,
} from '@mui/material';
import UiDialog from "@/components/uiDialog";
import {
    isNumeric, OutcomeProps,
} from "@/utils/util";
import {setOutcomeHelper} from "@/utils/validators";
import {Bag, CheckInResult} from "@/types/models";
import {checkinBag} from "@/actions/endpoints";
import Box from "@mui/material/Box";
import {generateBagId} from "@/utils/ticketGenerator";
import {DataRow} from "@/types/dataRow";
import UITable from "../uiTable";

interface SuccessRow extends DataRow {
    bag: string;
    weight: number;
    ticket: string;
    flight: string;
    location: string;
}

interface CheckInDialogProps {
    open: boolean;
    onClose: () => void;
    ticket: string;
    flight: string;
}

const CheckInDialog = ({
                           open,
                           onClose,
                           ticket,
                           flight,
                       }: CheckInDialogProps) => {

    const [outcome, setOutcome] = React.useState<OutcomeProps>();
    const [bags, setBags] = React.useState<Bag[]>([]);
    const [getBags, setGetBags] = React.useState<Bag[]>([]);

    const MAX_BAGS = 100; // optional rule

    const handleAddBag = () => {
        if (bags.length >= MAX_BAGS) return;

        const newBag: Bag = {
            bagId: generateBagId().toString(),
            weight: 0,
            ticketNumber: ticket,
        };

        setBags((prev) => [...prev, newBag]);
    };

    const handleRemoveBag = (id: string) => {
        setBags((prev) => prev.filter((bag) => bag.bagId !== id));
    };

    const handleWeightChange = (id: string, value: number) => {
        setBags((prev) =>
            prev.map((bag) =>
                bag.bagId === id ? {...bag, weight: value} : bag
            )
        );
    };


    const handleSubmit = async () => {
        if (ticket.length !== 10 || !isNumeric(ticket)) {
            return setOutcomeHelper('error', 'Something went wrong: Re-verify passenger', setOutcome);
        }

        // Check-in Baggage(Bages) and Update Passenger Status
        const result: CheckInResult = await checkinBag(bags);

        if (result.success) {
            setGetBags(result.bags);
            setOutcome({status: 'success', message: 'Passenger checked-in successfully',});
            setOutcomeHelper('success', 'Passenger checked-in successfully!', setOutcome);
            // console.log("Passenger checked-in!");
            resetForm();
        } else {
            setOutcome({status: 'error', message: result.error ?? ''});
            console.log(result.error);
        }
    };

    const resetForm = () => {
        // Reset form when dialog is closed
        // Clear the outcome
        setOutcome(undefined);
        setBags([]);
        // Call the onClose function passed from the parent
        // onClose();
    };

    return (
        <UiDialog
            open={open}
            onCancel={onClose}
            title="Baggage Check In"
            onConfirm={handleSubmit}
            cancelLabel={'Cancel'}
            confirmDisabled={!ticket || !flight || !bags.length}
            confirmLabel={'Check-In'}
            content={
                <>
                    <Stack spacing={1}>
                        {bags.map((bag, index) => (
                            <Card key={bag.bagId} variant="outlined">
                                <CardContent>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        gap={2}
                                    >
                                        <Typography variant="subtitle1" sx={{minWidth: 50}}>
                                            #{index + 1}
                                        </Typography>

                                        <TextField
                                            type="number"
                                            label="Weight (kg)"
                                            size="small"
                                            value={bag.weight}
                                            onChange={(e) =>
                                                handleWeightChange(bag.bagId, Number(e.target.value))
                                            }
                                            sx={{p: 0, m: 0, textTransform: 'none'}}
                                            slotProps={{
                                                input: {
                                                    id: `weight-${bag.bagId}`
                                                },
                                            }}
                                            fullWidth
                                        />

                                        <Button variant="outlined" color="error" size="medium"
                                                sx={{textTransform: 'none'}}
                                                onClick={() => handleRemoveBag(bag.bagId)}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{textTransform: 'none'}}
                                onClick={handleAddBag}
                                disabled={bags.length >= MAX_BAGS}
                            >
                                Add Bag
                            </Button>

                            <Typography alignSelf="center">
                                Total Bags: {bags.length > 0 ? bags.length : 0}
                            </Typography>
                        </Stack>
                        {
                            getBags && getBags.length > 0 && (
                                <UITable<SuccessRow>
                                    tableSize='small'
                                    comp='span'
                                    align="left"
                                    columns={['Bag', 'Weight', "flight", "ticket", 'Location']}
                                    rows={getBags.map(b => ({
                                        bag: b.weight===0 ? 'None':b.bagId,
                                        weight: b.weight,
                                        flight: flight,
                                        ticket: ticket,
                                        location: b.location as string,
                                    }) as SuccessRow)}
                                />
                            )
                        }
                    </Stack>
                    {outcome && outcome.status !== undefined && (
                        <Alert severity={outcome.status}>{outcome.message}</Alert>
                    )}
                </>
            }/>
    );
}

export default CheckInDialog;


{/*This must be changed to BagLocations
                    <AutocompleteDropdown
                        label="Number of Bags" data={numberOfBags}
                        value={numberBags}
                        onChange={clearOutcomeErrorString(setNumberBags, setOutcome)}
                    />
                    */
}