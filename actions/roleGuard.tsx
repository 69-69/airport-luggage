import React, {ReactNode, useEffect} from 'react'
import {RoleEnum} from "@/types/userRole";
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";

interface RoleGuardProps {
    allowedRoles: RoleEnum[];
    children: ReactNode;
}

const RoleGuard = ({allowedRoles, children}: RoleGuardProps) => {
    const router = useRouter();
    const {user, loading, logout} = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in: redirect to `login`, preserve intended path
                router.push(`/?redirect=${pathname}`);
                return;
            }
            // Cast string to enum
            if (!allowedRoles.includes(user.role as RoleEnum)) {
                // Not allowed: logout and redirect back to previous page after login
                logout(`/?redirect=${pathname}`);
                return;
            }
        }
    }, [loading, user, allowedRoles, router, pathname]);

    if (loading || !user) return <FullScreenLoader/>;

    return <>{children}</>;
}

export default RoleGuard
