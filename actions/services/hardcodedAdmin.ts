// actions/services/hardcodedAdmin.ts
import { User } from "@/types/models";
import {RoleEnum} from "@/types/userRole";

export const ADMIN_USER: User = {
    email: "admin@gmail.com",
    phone: "9487642142",
    username: "admin",
    password: "Admin@123", // hashed in userService
    role: RoleEnum.ADMIN,
    firstName: "Super",
    lastName: "Admin",
    firstLogin: false // already can `login`, hence does not change password
};
