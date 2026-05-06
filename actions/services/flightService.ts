// actions/services/flightService.ts

import storageService from "@/actions/services/storageService";
import {Flight, FlightStatusEnum} from "@/types/models";

const _KEY = "all_flights";
const flightBaseApi = 'http://localhost:8080/api/flights';

export const flightService = {
    getAll(): Flight[] {
        return storageService.get(_KEY, []);
    },

    findByAirlineCodeAndGate(airlineCode: string, gateNumber: string): Flight | undefined {
        const flights = this.getAll();

        return flights.find(
            (f: Flight) =>
                f.flightNumber.toLowerCase().startsWith(airlineCode.toLowerCase())
                && f.gate === gateNumber
        );
    },

    getAllByFlightNumber(flightNumbers: string[]): Flight[] {
        const flights = this.getAll();

        if (!flights.length) {
            return [];
        }

        return flights.filter((flight: Flight) =>
            flightNumbers.includes(flight.flightNumber)
        );
    },

    add(flight: Omit<Flight, "tickets">): Flight {
        const flights: Flight[] = this.getAll();

        if (flights.some((f) => f.flightId === flight.flightId)) {
            throw new Error(`Flight ID: ${flight.flightId} already exists`);
        }

        const idx = flights.findIndex(f => f.gate === flight.gate);
        if (idx !== -1) {
            const flight = flights[idx];
            throw new Error(`Gate ${flight.gate} already assigned to flight ${flight.flightNumber}`);
        }

        if (flights.some((f) => f.flightNumber === flight.flightNumber)) {
            throw new Error(`Flight ${flight.flightNumber} already exists`);
        }

        const newFlight: Flight = {
            ...flight,
            status: FlightStatusEnum.SCHEDULED,
            tickets: []
        };
        flights.push(newFlight);
        storageService.set(_KEY, flights);

        return newFlight;
    },

    find(flightNumber: string) {
        const flights = this.getAll();
        const idx = flights.findIndex(f => f.flightNumber === flightNumber);
        return {flights, idx};
    },

    changeGate(
        flightNumber: string,
        {gate, terminal}: { gate: string, terminal: string }
    ): Flight | undefined {
        if (!flightNumber) return;

        const passengers = this.getAll();
        const p = passengers.find(p => p.flightNumber === flightNumber);

        if (!p) {
            throw new Error("Flight not found");
        }

        p.gate = gate;
        p.terminal = terminal;
        storageService.set(_KEY, passengers);

        return p;
    },

    update({flightNumber, ticket}: { flightNumber: string, ticket: string }): void {
        const {flights, idx} = this.find(flightNumber);

        if (idx === -1) throw new Error("Flight not found");

        if (flights[idx].tickets.indexOf(ticket) > -1) {
            throw new Error(`Ticket ${ticket} already in use`);
        }

        // Add new ticket
        flights[idx].tickets.push(ticket);

        storageService.set(_KEY, flights);
    },

    updateStatus(flightNumber: string, status?: FlightStatusEnum): void {
        const {flights, idx} = this.find(flightNumber);

        if (idx === -1) throw new Error("Flight not found");

        // Update Status as Departed
        flights[idx].status = status ?? FlightStatusEnum.DEPARTED;

        storageService.set(_KEY, flights);
    },

    async remove(flightNumber: string) {
        const flights = this.getAll();

        if (flights.some((f) => f.tickets.length > 0 && f.status !== FlightStatusEnum.SCHEDULED)) {
            throw new Error(
                `Cannot remove Flight ${flightNumber}: its currently has assigned passengers and is ${FlightStatusEnum.SCHEDULED.toString()}. ` +
                `Please reassign all passengers to other flights before proceeding.`
            );
        }

        storageService.set(_KEY, flights.filter((f) => f.flightNumber !== flightNumber));
        //
        await flightService.removeRemote(flightNumber);
    },

    removeTicket(flightNumber: string, ticket: string): void {
        const flights = this.getAll();
        const flight = flights.find(f => f.flightNumber === flightNumber);

        if (!flight) return; // throw new Error("Flight not found");

        const initialLength = flight.tickets.length;

        flight.tickets = flight.tickets.filter(t => t !== ticket);

        if (flight.tickets.length === initialLength) {
            throw new Error("Ticket not found on flight");
        }

        storageService.set(_KEY, flights);
    },

    /// Remote API Calls:

    async addRemote(flight: Omit<Flight, "tickets" | "flightId">): Promise<Flight> {

        const response = await fetch(flightBaseApi + "/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({...flight, flightCode: flight.flightNumber})
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Failed to create flight", err.message);
            throw new Error(err?.message ?? "Failed to create flight");
        }

        return await response.json();
    },

    async changeGateRemote(
        flightNumber: string,
        {gate, terminal}: { gate: string, terminal: string }
    ): Promise<Flight> {

        const response = await fetch(
            `${flightBaseApi}/change-gate/${flightNumber}`,
            {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({gate, terminal})
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update gate");
        }

        return await response.json();
    },

    async addTicketRemote(
        flightNumber: string,
        ticket: string
    ): Promise<void> {

        const response = await fetch(
            `${flightBaseApi}/${flightNumber}/tickets`,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ticket})
            }
        );

        if (!response.ok) {
            throw new Error("Failed to add ticket");
        }
    },

    async updateStatusRemote(flightNumber: string, status?: FlightStatusEnum): Promise<void> {
        const flightStatus = status ?? FlightStatusEnum.DEPARTED;

        const response = await fetch(
            `${flightBaseApi}/update-status/${flightNumber}/${flightStatus}`,
            {method: "PUT"}
        );

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? `Failed to update flight ${flightNumber} Status`);
        }
    },

    async removeRemote(flightNumber: string): Promise<void> {

        const response = await fetch(
            `${flightBaseApi}/${flightNumber}`,
            {method: "DELETE"}
        );

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? "Failed to delete flight");
        }
    },

    async removeTicketRemote(
        flightNumber: string,
        ticket: string
    ): Promise<void> {

        const response = await fetch(
            `${flightBaseApi}/${flightNumber}/tickets/${ticket}`,
            {method: "DELETE"}
        );

        if (!response.ok) {
            throw new Error("Failed to remove ticket");
        }
    },

    async getAllRemote(): Promise<Flight[]> {
        const response = await fetch(flightBaseApi);

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err || "Failed to fetch flights");
        }

        return await response.json();
    },

    async findByAirlineCodeAndGateRemote(
        airlineCode: string,
        gateNumber: string
    ): Promise<Flight | undefined> {

        const response = await fetch(
            `${flightBaseApi}/search?airlineCode=${airlineCode}&gate=${gateNumber}`
        );

        if (!response.ok) {
            throw new Error("Failed to search flight");
        }

        return await response.json();
    },

    async getAllByFlightNumbersRemote(
        flightNumbers: string[]
    ): Promise<Flight[]> {

        const response = await fetch(
            `${flightBaseApi}/batch`,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(flightNumbers)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch flights");
        }

        return await response.json();
    }


    /*assignFlight({flightNumber, ticket}: { flightNumber: string, ticket: string }): void {
         const {flights, idx} = this.find(flightNumber);

         if (idx === -1) throw new Error("Flight not found");

         if (flights[idx].tickets.indexOf(ticket) > -1) {
             throw new Error(`Ticket ${ticket} already assign to flight ${flightNumber}`);
         }

         // Add new ticket
         flights[idx].tickets.push(ticket);

         storageService.set(_KEY, flights);
     },*/
}