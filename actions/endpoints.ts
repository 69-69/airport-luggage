import {DataRow} from "@/types/dataRow";
import {usernameGenerator} from "@/utils/usernameGenerator";
import {passwordGenerator} from "@/utils/passwordGenerator";
import {Bag, CheckInResult, MessageBoard, SendResult, UserRole, PassengerResult} from "@/types/models";
import {userService} from "@/actions/services/userService";
import {passengerService} from "@/actions/services/passengerService";
import {RoleEnum} from "@/types/userRole";
import {flightService} from "@/actions/services/flightService";
import {messageBoardService} from "@/actions/services/messageBoardService";
import {bagService} from "@/actions/services/bagService";

// Staff
export const addStaff = async (row: DataRow): Promise<SendResult> => {

    try {
        const {firstName, lastName, role, airline, email, phone,} = row;

        // Validate required fields to prevent null/undefined errors
        if (!firstName || !lastName || !role || !airline || !email || !phone) {
            return {
                success: false,
                error: 'All fields are required',
            };
        }

        const username = usernameGenerator(firstName!.toString(), lastName!.toString());
        const password = passwordGenerator();
        const userData = {
            role: role as UserRole,
            firstName: firstName as string,
            lastName: lastName as string,
            airline: airline as string,
            email: email as string,
            username,
            password,
        };
        console.log('user-Data', username, password);

        // 1. Add staff locally
        try {
            userService.add({
                ...userData,
                phone: phone as string,
            });
        } catch (addError) {
            return {
                success: false,
                error: `Failed to add user: ${addError instanceof Error ? addError.message : 'Unknown error'}`,
            };
        }

        // 2. Send email
        const emailResult = await userService.sendEmail(userData);
        if (!emailResult.success) {
            return {
                success: false,
                error: `Failed to send email: ${emailResult.error}`,
            };
        }

        return emailResult;

    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Email service error",
        };
    }

};


// Flight
export function addFlight(data: DataRow): SendResult {
    try {
        const {airlineName, destination, flightId, flightNumber, terminal, gate, departureTime} = data;

        if (!airlineName || !flightId || !flightNumber || !terminal || !gate || !departureTime) {
            return {success: false, error: 'All Flight fields are required'};
        }

        // 1. Add staff locally
        try {
            flightService.add({
                gate: gate as string,
                terminal: terminal as string,
                airlineName: airlineName as string,
                destination: destination as string,
                flightId: flightId as string,
                flightNumber: flightNumber as string,
                departureTime: departureTime as string
            });
        } catch (addError) {
            return {
                success: false,
                error: `Failed to add flight: ${addError instanceof Error ? addError.message : 'Unknown error'}`,
            };
        }

    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to add flight",
        };
    }
    console.log('added new flight', data);
    return {success: true};
}

// Bags
export function checkinBag(bags: Bag[]): CheckInResult {
    try {
        if (!bags || !bags.length) {
            return {success: false, error: 'All fields are required'};
        }

        // 1. Add staff locally
        try {
            const data = bagService.add(bags);
            return {success: true, bags: data};
        } catch (addError) {
            return {
                success: false,
                error: `Failed to check-in bag: ${addError instanceof Error ? addError.message : 'Unknown error'}`,
            };
        }

    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to check-in bag",
        };
    }
}

// Passenger
export function addPassenger(data: DataRow): SendResult {
    try {
        const {firstName, lastName, idNumber, ticketNumber, flightNumber} = data;

        if (!firstName || !lastName || !idNumber || !ticketNumber) {
            return {success: false, error: 'All fields are required'};
        }

        // 1. Add staff locally
        try {
            passengerService.add({
                role: RoleEnum.PASSENGER,
                firstName: firstName as string,
                lastName: lastName as string,
                idNumber: idNumber as string,
                ticketNumber: ticketNumber as string,
                flightNumber: flightNumber as string
            });
        } catch (addError) {
            return {
                success: false,
                error: `Failed to add passenger: ${addError instanceof Error ? addError.message : 'Unknown error'}`,
            };
        }

    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to add passenger",
        };
    }
    console.log('added new passenger', data);
    return {success: true};
}

export function verifyPassenger(
    {idNumber, ticketNumber,}: {
        idNumber: string;
        ticketNumber: string;
    }): PassengerResult {

    if (!idNumber || !ticketNumber) {
        return {success: false, error: "All fields are required"};
    }

    try {
        const passenger = passengerService.findByTicketAndIdNumber(
            ticketNumber, idNumber
        );
        return {success: true, passenger};

    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to get passenger",
        };
    }
}

// Message Board
export function postMessage(data: DataRow): SendResult {
    try {
        // ROLE act as recipient
        const {message, to, airline, fromRole} = data;

        if (!message || !to || !fromRole) {
            return {success: false, error: 'All fields are required'};
        }

        // 1. Post message
        try {
            messageBoardService.post({
                role: to as UserRole,
                msg: {
                    message,
                    to,
                    fromRole,
                    airline,
                } as MessageBoard
            });
        } catch (addError) {
            return {
                success: false,
                error: `Failed to post message: ${addError instanceof Error ? addError.message : 'Unknown error'}`,
            };
        }

    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to post message",
        };
    }
    console.log('added new passenger', data);
    return {success: true};
}



