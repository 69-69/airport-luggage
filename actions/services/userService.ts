// actions/services/userService.ts

import storageService from "@/actions/services/storageService";
import {hashPassword} from "@/utils/crypto";
import {SendResult, User, UserRole} from "@/types/models";
import {ADMIN_USER} from "@/actions/services/hardcodedAdmin";
import {RoleEnum} from "@/types/userRole";
import {toSentenceCase} from "@/utils/util";

const _KEY = "all_users";
const userBaseApi = 'http://localhost:8080/api/users';

export const userService = {

    add(user: Omit<User, "firstLogin">): User {
        const users = this.getAll();

        if (users.some(u => u.username === user.username)) {
            throw new Error("Username already exists");
        }

        if (users.some(u => u.email === user.email)) {
            throw new Error("Email address already exists");
        }

        if (users.some(u => u.phone === user.phone)) {
            throw new Error("Phone number already exists");
        }

        const newUser: User = {
            ...user,
            password: hashPassword(user.password),
            firstLogin: true,
        };

        users.push(newUser);
        storageService.set(_KEY, users);
        return newUser;
    },

    getAll(isLogin?: boolean): User[] {
        const users: User[] = storageService.get<User[]>(_KEY, []);

        // Ensure Admin exists
        if (!users.some(u => u.role === (RoleEnum.ADMIN as UserRole))) {
            const adminCopy = {...ADMIN_USER, password: hashPassword(ADMIN_USER.password)};
            users.push(adminCopy);
            storageService.set(_KEY, users);
        }

        if (isLogin) return users;

        // Remove the admin user from the list
        return users.filter(u => u.role !== (RoleEnum.ADMIN as UserRole));
    },

    remove(phone: string) {
        if (phone === "9487642142") {
            throw new Error("Cannot remove hardcoded Admin");
        }

        storageService.set(
            _KEY,
            this.getAll().filter(u => u.phone !== phone)
        );
    },

    find(username: string) {
        const users = this.getAll();
        const idx = users.findIndex(u => u.username === username);
        return {users, idx};
    },

    updatePassword(username: string, newPassword: string, firstLogin = false) {
        const {users, idx} = this.find(username);

        if (idx === -1) throw new Error("User not found");

        users[idx].password = hashPassword(newPassword);
        // Mark firstLogin as false
        users[idx].firstLogin = firstLogin;

        storageService.set(_KEY, users);
    },

    setFirstLoginFalse(username: string) {
        const {users, idx} = this.find(username);

        if (idx === -1) throw new Error("User not found");

        users[idx].firstLogin = false;
        storageService.set(_KEY, users);
    },

    /// REMOTE API CALLS:
    async removeRemote(phone: string): Promise<void> {
        const response = await fetch(userBaseApi + "/" + phone, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? 'Failed to remove user');
        }
    },

    async getAllRemote(isLogin?: boolean): Promise<User[]> {
        const response = await fetch(userBaseApi, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Failed to fetch users: ${err}`);
        }

        const users: User[] = await response.json();

        // Optionally filter out admin for non-login view
        if (!isLogin) {
            return users.filter(u => u.role !== RoleEnum.ADMIN);
        }

        return users;
    },

    async findRemote(username: string): Promise<User> {
        const response = await fetch(`${userBaseApi}/${username}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? 'Failed to find user');
        }

        return await response.json();
    },

    async addRemote(user: Omit<User, "firstLogin">): Promise<User> {
        // Ensure password is hashed locally if needed
        // const hashedPassword = hashPassword(user.password);

        const response = await fetch(userBaseApi + '/register', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...user,
                password: user.password,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? "Failed to create user on server");
        }

        return await response.json();
    },

    async updatePasswordRemote(username: string, newPassword: string, firstLogin = false): Promise<void> {
        const response = await fetch(`${userBaseApi}/${username}/password`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({newPassword, firstLogin}),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? 'Failed to update password');
        }
    },

    async sendEmail(user: Omit<User, "firstLogin" | "phone">): Promise<SendResult> {
        const {role, airline, firstName, lastName, email, username, password} = user;

        // 2. Send email to staff
        try {
            // fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`)
            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    to: email,
                    subject: "Your Staff Account is Created",
                    text: `Hello ${toSentenceCase(firstName)} ${toSentenceCase(lastName)},
                    Your account has been created with the following details:
                    
                    Role: ${role.toUpperCase()} STAFF
                    Airline: ${airline?.toUpperCase() ?? 'N/A'}
                    Username: ${username}
                    Password: ${password}
                    
                    Please log in and change your password immediately to secure your account.
                    
                    Thank you,
                    ©${new Date().getFullYear()} Airport Luggage Handling System (CS-73336)`,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                return {
                    success: false,
                    error: data?.error ?? "Failed to send email",
                };
            }

            return {success: true};
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : "Email service error",
            };
        }
    },

};
