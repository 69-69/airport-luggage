// actions/services/bagService.ts
import storageService from "@/actions/services/storageService";
import {Bag, BagLocationEnum} from "@/types/models";

const _KEY = "all_bags";

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

    add(bags: Bag[]): Bag[] {
        const newBags: Bag[] = bags.map((bag) => ({
            ...bag,
            location: BagLocationEnum.CHECKIN_COUNTER,
        }));

        storageService.set(_KEY, [...this.getAll(), ...newBags]);

        return newBags;
    },

    getBagsByTicket(ticketId: string): number {
        const allBags = this.getAll(); // get all bags

        // Filter bags that match the ticket number exactly
        const matchingBags = allBags.filter(
            (bag) => bag.ticketNumber === ticketId
        );

        return matchingBags.length;
    },

    remove(ticketNumber: string) {
        storageService.set(
            _KEY,
            this.getAll().filter(u => u.ticketNumber !== ticketNumber)
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
        if (!status){
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
