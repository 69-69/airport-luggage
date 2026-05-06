// route/register-staff
import {NextRequest, NextResponse} from "next/server";
import {User} from "@/types/models";

export async function POST(req: NextRequest) {
    try {
        const {
            role,
            email,
            phone,
            username,
            password,
            firstName,
            lastName,
            airline
        } = await req.json() as User;

        if (!role || !email || !phone || !username || !password || !firstName || !lastName || !airline) {
            return NextResponse.json({success: false, error: "Missing fields"}, {status: 400});
        }

        // Build the payload
        const userPayload = {role, airline, email, phone, username, password, firstname: firstName, lastname: lastName};

        // Send to Spring Boot backend
        const res = await fetch('http://localhost:8080/api/users/register', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(userPayload),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({
                success: false,
                error: data?.message ?? "Failed to register user"
            }, {status: res.status});
        }

        return NextResponse.json({success: true, user: data});
    } catch (err) {
        console.error(err);
        return NextResponse.json({success: false, error: (err as Error).message}, {status: 500});
    }
}