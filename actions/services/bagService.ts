// actions/services/bagService.ts
import storageService from "@/actions/services/storageService";
import {Bag, BagLocationEnum} from "@/types/models";

const _KEY = "all_bags";
const bagBaseApi = 'http://localhost:8080/api/bags';

export const bagService = {
    getAll(): Bag[] {
        return storageService.get(_KEY, []);
    },

    getAllByTickets(tickets: string[]): Bag[] {
        const bags = this.getAll();

        if (!bags.length) {
            return [];
        }

        return bags.filter((b: Bag) => tickets.includes(b.ticketNumber));
    },

    getBagsByTicket(ticketId: string): number {
        const allBags = this.getAll(); // get all bags

        // Filter bags that match the ticket number exactly
        const matchingBags = allBags.filter(
            (bag) => bag.ticketNumber === ticketId
        );

        return matchingBags.length;
    },

    getBagsByPassengerTicket(ticketId: string): Bag[] {
        const allBags = this.getAll();

        return allBags.filter((bag) => bag.ticketNumber === ticketId);
    },

    add(bags: Bag[]): Bag[] {
        const newBags: Bag[] = bags.map((bag) => ({
            ...bag,
            location: BagLocationEnum.CHECKIN_COUNTER,
        }));

        storageService.set(_KEY, [...this.getAll(), ...newBags]);

        return newBags;
    },

    removeAll(ticketNumber: string) {
        storageService.set(
            _KEY,
            this.getAll().filter(u => u.ticketNumber !== ticketNumber)
        );
    },

    removeById(bagId: string) {
        storageService.set(
            _KEY,
            this.getAll().filter(u => u.bagId !== bagId)
        );
    },

    loadToFlight(bagId: string) {
        const bags = this.getAll();
        const bag = bags.find(b => b.bagId === bagId);

        if (!bag) {
            throw new Error("No bag found");
        }

        /*const passenger = passengerService
            .getAll()
            .find(p => p.ticketNumber === bag.ticketNumber);

        if (passenger?.status !== PassengerStatusEnum.BOARDED) {
            throw new Error("Passenger not yet onboard");
        }*/

        bag.location = BagLocationEnum.LOADED;
        storageService.set(_KEY, bags);
    },

    moveTo(bagId: string, status: BagLocationEnum) {
        if (!status) {
            throw new Error("Select the new status of the bag");
        }
        const bags: Bag[] = this.getAll();
        const bag = bags.find(b => b.bagId === bagId);

        if (!bag) {
            throw new Error("No bag found");
        }

        bag.location = status; // means Bag is Cleared, no violation
        storageService.set(_KEY, bags);
    },

    /// Remote API Calls:
    async addRemote(bags: Bag[]): Promise<Bag[]> {
        const response = await fetch(bagBaseApi + "/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                bags.map(bag => ({
                    ...bag,
                    location: BagLocationEnum.CHECKIN_COUNTER
                }))
            )
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Failed to create bags", err.message);
            throw new Error(err?.message ?? "Failed to create bags");
        }

        return await response.json();
    },


    async removeRemote(id: string): Promise<void> {

        const response = await fetch(`${bagBaseApi}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Failed to delete bags", err.message);
            throw new Error(err?.message ?? "Failed to delete bags");
        }
    },


    async changeBagLocationRemote(bagId: string, location: string): Promise<Bag> {

        const response = await fetch(`${bagBaseApi}/update-location/${bagId}/${location}`, {
            method: "PATCH"
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Failed to load bag to flight", err.message);
            throw new Error(err?.message ?? "Failed to load bag");
        }

        return await response.json();
    },


    async moveToRemote(bagId: string, status: BagLocationEnum): Promise<Bag> {

        if (!status) {
            throw new Error("Select the new status of the bag");
        }

        const response = await fetch(`${bagBaseApi}/${bagId}/move`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({location: status})
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Failed to update bag status", err.message);
            throw new Error(err?.message ?? "Failed to update bag status");
        }

        return await response.json();
    }


    /*add2(bag: Omit<Bag, "bagId" | "location">): Bag {
        const newBag: Bag = {
            bagId: randomUUID(),
            location: { type: BagLocationEnum.CHECKIN_COUNTER, terminal: 'T1', counter: 'C5' },
            ...bag
        };

        storageService.set(_KEY, [...this.getAll(), bag]);
        return newBag;
    },*/
};
