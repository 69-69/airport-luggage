// types/models.ts


export type UserRole = 'ADMIN' | 'AIRLINE' | 'GATE' | 'GROUND' | 'PASSENGER';

/// Status String
export type FlightStatus = "DEPARTED" | "BOARDING" | "SCHEDULED";

export type PassengerStatus = "NOT_CHECKED_IN" | "CHECKED_IN" | "BOARDED";

export type BagLocation = "CHECKIN_COUNTER" | "SECURITY_CHECK" | "GATE" | "LOADED";

export enum FlightStatusEnum {
    DEPARTED = "DEPARTED",
    SCHEDULED = "SCHEDULED",
    BOARDING = "BOARDING"
}

// Steven

/// Status Enum
export enum PassengerStatusEnum {
    NOT_CHECKED_IN = "NOT_CHECKED_IN",
    CHECKED_IN = "CHECKED_IN",
    BOARDED = "BOARDED"
}

export enum BagLocationEnum {
    CHECKIN_COUNTER = "CHECKIN_COUNTER",
    SECURITY_CHECK = "SECURITY_CHECK", // Security violation
    LOADED = "LOADED", // Means Bag is loaded to the plane/flight
    GATE = "GATE", // Means Bag is Cleared, no violation
}

export type User = {
    role: UserRole;
    email: string;
    phone: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    airline?: string;
    workMode?: string; // Gate (G1, G2, etc) or Security Clearance
    firstLogin: boolean;
};

export type Flight = {
    airlineName: string; // America Airline
    destination: string;
    flightId: string; // 1234
    flightNumber: string; // AA1234
    terminal: string;
    gate: string;
    departureTime: string;
    tickets: string[];
    status?: FlightStatus;
};

export type FlightSnapshot = {
    flightNumber: string;
    ticketNumber: string;
}

export type Passenger = {
    role: UserRole,
    firstName: string;
    lastName: string;
    idNumber: string; // Same as identification or passport number/driver license
    ticketNumber: string;
    flightNumber: string;
    status: PassengerStatus;
};

/*| { type: "CHECKIN_COUNTER"; terminal: string; counter: string } // When a passenger checks in a bag
| { type: "SECURITY_CHECK"; terminal: string; gate: string } // When the bag is at clearance or has violated
| { type: "GATE"; terminal: string; gate: string } // When the bag is Cleared, then move to the gate
| { type: "LOADED"; flightNumber: string }; // When the bag is loaded onto the plane*/

export type Bag = {
    bagId: string;
    weight: number;
    ticketNumber: string;
    location?: BagLocation;
};

export type MessageBoard = {
    id: string;        // seconds-based
    message: string;
    to: string;
    fromRole: UserRole;
    fromUsername?: string;
    airline?: string;
    timestamp: string; // ISO string
    isRead: boolean;
};

/*export type MessageBoardKey =
    | "AIRLINE"
    | "GATE"
    | "GROUND";

export type LoginInput = {
    username: string;
    password: string;
};*/

export type AuthUser = {
    username: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    airline?: string;
    workMode?: string; // Gate (G1, G2, etc) or Security Clearance
    firstLogin: boolean;
};

export type AuthResult =
    | { success: true; user: AuthUser }
    | { success: false; error: string };

export type SendResult = {
    success: boolean;
    error?: string;  // Optional error message in case of failure
};

export type PassengerResult =
    | { success: true; passenger: Passenger }
    | { success: false; error: string };

export type CheckInResult =
    | { success: true; bags: Bag[] }
    | { success: false; error: string };




