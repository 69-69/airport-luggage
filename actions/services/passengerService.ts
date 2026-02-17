// actions/services/passengerService.ts

import storageService from "@/actions/services/storageService";
import {AuthResult, FlightSnapshot, Passenger, PassengerStatusEnum} from "@/types/models";
import {flightService} from "@/actions/services/flightService";

const _KEY = "all_passengers";

export const passengerService = {
    getAll(): Passenger[] {
        return storageService.get(_KEY, []);
    },

    add(passenger: Omit<Passenger, "status">): Passenger {
        const passengers: Passenger[] = this.getAll();

        if (passengers.some(p => p.ticketNumber === passenger.ticketNumber)) {
            throw new Error(`Passenger with ticket ${passenger.ticketNumber} already exists`);
        }

        const newPassenger: Passenger = {
            ...passenger,
            status: PassengerStatusEnum.NOT_CHECKED_IN
        };

        passengers.push(newPassenger);
        storageService.set(_KEY, passengers);

        return newPassenger;
    },

    findByTicket(ticketNumber: string): Passenger {
        const passengers: Passenger[] = this.getAll();

        const passenger = passengers.find(
            p => p.ticketNumber === ticketNumber
        );

        if (!passenger) {
            throw new Error(`Passenger with ticket ${ticketNumber} does not exist`);
        }

        return passenger;
    },

    findByTicketAndIdNumber(ticketNumber: string, idNumber: string): Passenger {
        const passengers: Passenger[] = this.getAll();

        const passenger = passengers.find(
            p => p.ticketNumber === ticketNumber && p.idNumber === idNumber
        );

        if (!passenger) {
            throw new Error(`Passenger with ticket ${ticketNumber} does not exist`);
        }

        return passenger;
    },

    findSnapshotById(idNumber: string): FlightSnapshot[] {
        const passengers: Passenger[] = this.getAll();

        // Filter all flights for this passenger
        const flights = passengers.filter(p => p.idNumber === idNumber);

        if (flights.length === 0) {
            throw new Error(`Passenger with ID ${idNumber} does not exist`);
        }

        // Return flightNumber + ticketNumber
        return flights.map(f => ({
            flightNumber: f.flightNumber,
            ticketNumber: f.ticketNumber,
        }));
    },

    findByFlightNumber(flightNumber: string): Passenger[] {
        const passengers: Passenger[] = this.getAll();

        if (!passengers.length) {
            return [];
        }

        return passengers.filter((p: Passenger) => p.flightNumber === flightNumber);
    },

    /*findByTicketNumber(ticketNumber: string): Passenger | undefined {
        const passengers: Passenger[] = this.getAll();

        return passengers.find((p: Passenger) => p.ticketNumber === ticketNumber);
    },*/

    login(ticketNumber: string, idNumber: string): AuthResult {
        try {
            const passenger = this.findByTicketAndIdNumber(ticketNumber, idNumber);

            return {
                success: true,
                user: {
                    role: passenger.role,
                    username: passenger.idNumber,
                    firstName: passenger.firstName,
                    lastName: passenger.lastName,
                    airline: passenger.flightNumber,
                    workMode: 'Passenger',
                    firstLogin: false
                }
            };
        } catch (err) {
            return {success: false, error: (err as Error).message};
        }
    },

    /*updateStatus(ticketNumber: string, status: PassengerStatus): void {
        const passengers = this.getAll();
        const p = passengers.find(p => p.ticketNumber === ticketNumber);

        if (!p) throw new Error("Passenger not found");

        p.status = status;
        storageService.set(_KEY, passengers);
    },

    updateFlight(ticketNumber: string, flightNumber: string): void {
        const passengers = this.getAll();
        const p = passengers.find(p => p.ticketNumber === ticketNumber);

        if (!p) throw new Error("Passenger not found");

        p.flightNumber = flightNumber;
        storageService.set(_KEY, passengers);
    },*/

    changePassengerFlight(ticket: string, newFlightNumber: string): void {
        const passengers = this.getAll();
        const flights = flightService.getAll();

        const passenger = passengers.find(p => p.ticketNumber === ticket);
        if (!passenger) throw new Error("Passenger not found");

        const oldFlightNumber = passenger.flightNumber;

        if (oldFlightNumber === newFlightNumber) {
            throw new Error(`Passenger already assigned to this Flight ${newFlightNumber}`);
        }

        const newFlight = flights.find(f => f.flightNumber === newFlightNumber);
        if (!newFlight) throw new Error("New flight not found");

        // 🔥 REMOVE FROM OLD FLIGHT (even if empty string check removed)
        const oldFlight = flights.find(f => f.flightNumber === oldFlightNumber);
        if (oldFlight) {
            oldFlight.tickets = oldFlight.tickets.filter(t => t !== ticket);
        }

        // Prevent duplicate
        if (newFlight.tickets.includes(ticket)) {
            throw new Error("Ticket already exists on new flight");
        }

        // Add to new flight
        newFlight.tickets.push(ticket);

        // Update passenger
        passenger.flightNumber = newFlightNumber;

        // Save both
        storageService.set(_KEY, passengers);
        storageService.set("all_flights", flights);
    },

    checkIn(ticketNumber: string) {
        const passengers = this.getAll();
        const p = passengers.find(p => p.ticketNumber === ticketNumber);
        if (!p) throw new Error("Passenger not found");

        p.status = PassengerStatusEnum.CHECKED_IN;
        storageService.set(_KEY, passengers);
    },

    board(ticketNumber: string): Passenger | undefined {
        const passengers = this.getAll();
        const p = passengers.find(p => p.ticketNumber === ticketNumber);

        if (p?.status !== PassengerStatusEnum.CHECKED_IN) {
            throw new Error("Passenger must be checked in");
        }

        p.status = PassengerStatusEnum.BOARDED;
        storageService.set(_KEY, passengers);

        return p;
    },

    remove(ticketNumber: string) {
        storageService.set(
            _KEY,
            this.getAll().filter(u => u.ticketNumber !== ticketNumber)
        );
    },
};

/* USAGE: updateStatus
try {
  passengerService.updateStatus(ticket, "CHECKED_IN");
  toast.success("Passenger checked in");
} catch (e) {
  toast.error(e.message);
}
*/
