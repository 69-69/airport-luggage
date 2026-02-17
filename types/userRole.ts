import {UserRole} from "@/types/models";

export const securityClearance = 'security';

export enum RoleEnum {
    ADMIN = 'ADMIN',
    AIRLINE = 'AIRLINE',
    GATE = 'GATE',
    GROUND = 'GROUND',
    PASSENGER = 'PASSENGER',
}

export const StaffRoles = [
    RoleEnum.AIRLINE,
    RoleEnum.GATE,
    RoleEnum.GROUND,
];


export const dashboardRedirectPath = ({role}: { role: UserRole }) => {
    const rolePaths: Record<UserRole, string> = {
        [RoleEnum.ADMIN]: 'admin',
        [RoleEnum.AIRLINE]: 'airline',
        [RoleEnum.GATE]: 'gate',
        [RoleEnum.GROUND]: 'ground',
        [RoleEnum.PASSENGER]: 'passenger',
    };

    const path = rolePaths[role] || '';
    return `/dashboard/${path}`;
};

