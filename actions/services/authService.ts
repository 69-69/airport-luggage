// services/authService.ts
import {userService} from "./userService";
import {comparePassword} from "@/utils/crypto";
import {AuthResult} from "@/types/models";

export const authService = {
    login(username: string, password: string): AuthResult {
        const users = userService.getAll(true);

        const user = users.find(u => u.username === username);

        if (!user) {
            return {success: false, error: "User not found"};
        }

        const valid = comparePassword(password, user.password);
        if (!valid) {
            return {success: false, error: "Invalid password"};
        }

        return {
            success: true,
            user: {
                role: user.role,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                airline: user.airline,
                workMode: user.workMode,
                firstLogin: user.firstLogin
            }
        };
    },

    /// Remote API calls:
    async loginRemote(username: string, password: string): Promise<void> {
        const response = await fetch("http://localhost:8080/api/users/login", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.message ?? 'Failed to login user');
        }
    },

};
