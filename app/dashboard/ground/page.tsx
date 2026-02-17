'use client';

import React from 'react';
import PageTitleUpdater from "@/components/pageTitleUpdater";
import {RoleEnum, securityClearance} from "@/types/userRole";
import RoleGuard from "@/actions/roleGuard";
import WorkAtClearanceDashboard from "@/app/dashboard/ground/work_at_clearance";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";
import WorkAtGateDashboard from "@/app/dashboard/ground/work_at_gate";


const GroundDashboard = () => {
    const {user, loading} = useAuth();

    if (loading) return <FullScreenLoader/>

    return (
        <RoleGuard allowedRoles={[RoleEnum.GROUND]}>
            <PageTitleUpdater/>

            {/*Switch between Pages */}
            {user?.workMode === securityClearance
                ? <WorkAtClearanceDashboard user={user}/>
                : <WorkAtGateDashboard user={user}/>}
        </RoleGuard>
    )
}
export default GroundDashboard
