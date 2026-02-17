// actions/services/flightService.ts

import storageService from "@/actions/services/storageService";
import {Flight} from "@/types/models";

const _KEY = "all_flights";

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

    remove(flightNumber: string) {
        const flights = this.getAll();

        if (flights.some((f) => f.tickets.length > 0)) {
            throw new Error(
                `Cannot remove Flight ${flightNumber}: it currently has assigned passengers. ` +
                `Please reassign all passengers to other flights before proceeding.`
            );
        }

        storageService.set(_KEY, flights.filter((f) => f.flightNumber !== flightNumber));
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