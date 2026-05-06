'use client';

import React, {useEffect, useState} from "react";
import {DataRow} from "@/types/dataRow";
import UITable from "@/components/uiTable";
import {Grid, TextField, Typography} from "@mui/material";
import {AuthUser, Bag, BagLocationEnum, Flight} from "@/types/models";
import {flightService} from "@/actions/services/flightService";
import {bagService} from "@/actions/services/bagService";

interface BaggageRow extends DataRow {
    bagId: string;
    flight: string;
    ticket: string;
    weight: string;
    gate: string;
    terminal: string;
    status: string;
}

const columns = ["bag id", "weight", "flight", "ticket", "gate", "terminal", "status"];

const ClearanceBags = ({user}: { user: AuthUser | null }) => {

    const [rows, setRows] = useState<BaggageRow[]>([]);
    const [filteredRows, setFilteredRows] = useState<BaggageRow[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch baggage for ground staff working at a gate
    const fetchFlights = () => {
        try {
            if (!user?.workMode) return;

            const flights: Flight[] = flightService.getAll();

            // Ground staff only restricted by gate (NOT airline)
            const gateFlights = flights.filter(
                (f: Flight) => f.airlineName === user.airline
            );

            if (!gateFlights.length) {
                setRows([]);
                setFilteredRows([]);
                return;
            }

            const flight = gateFlights[0];

            /// Recent change [allTickets]
            const allTickets = gateFlights.flatMap(f => f.tickets);

            const bags: Bag[] = bagService.getAllByTickets(allTickets)
                .filter((b) =>
                    b.location === BagLocationEnum.LOADED ||
                    b.location === BagLocationEnum.GATE
                );

            const mappedRows: BaggageRow[] = bags.map((b) => ({
                bagId: b.bagId.toString(),
                weight: b.weight + " kg",
                flight: flight.flightNumber,
                ticket: b.ticketNumber,
                gate: flight.gate.toUpperCase(),
                terminal: flight.terminal.toUpperCase(),
                status: b.location as string,
            }));

            setRows(mappedRows);

        } catch (e) {
            console.error("Error fetching baggage:", e);
        }
    };

    // 🔹 Load when user becomes available
    useEffect(() => {
        if (!user) return;
        fetchFlights();
    }, [user]);

    // 🔹 Auto filter when rows OR searchTerm changes
    useEffect(() => {
        if (!searchTerm) {
            setFilteredRows(rows);
            return;
        }

        const term = searchTerm.toLowerCase().trim();

        const filtered = rows.filter((row) =>
            Object.values(row).some(value =>
                value?.toString().toLowerCase().includes(term)
            )
        );

        setFilteredRows(filtered);
    }, [rows, searchTerm]);

    return (
        <UITable<BaggageRow>
            columns={columns}
            rows={filteredRows}
            title="Baggage Manifest"
            topAlignment="justify"
            topButton={
                rows.length > 0 && (<Grid
                    container
                    rowSpacing={2}
                    columnSpacing={{xs: 1, sm: 2, md: 2}}
                    sx={{justifyContent: "space-between"}}
                >
                    <Grid size={{xs: 12, md: 3}}>
                        <Typography variant="h6" component="h4" gutterBottom>
                            [ List of Baggage ]
                        </Typography>
                    </Grid>

                    <Grid size={{xs: 12, md: 3}}>
                        <TextField
                            size="small"
                            placeholder="Search by any..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            fullWidth
                        />
                    </Grid>
                </Grid>)
            }
            onActionCallback={() => {
            }}
        />
    );
};

export default ClearanceBags;
