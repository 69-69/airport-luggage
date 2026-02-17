'use client';

import React from 'react';
import PageTitleUpdater from "@/components/pageTitleUpdater";
import {RoleEnum, securityClearance} from "@/types/userRole";
import RoleGuard from "@/actions/roleGuard";
import WorkAtClearanceDashboard from "@/app/dashboard/ground/work_at_clearance";
import {useAuth} from "@/actions/authContext";
import FullScreenLoader from "@/components/fullScreenLoader";
import WorkAtGateDashboard from "@/app/dashboard/ground/work_at_gate";
import ClearanceBags from "@/app/dashboard/ground/baggage/clearance_bags";
import GateBags from "@/app/dashboard/ground/baggage/gate_bags";


const BaggageManifest = () => {
    const {user, loading} = useAuth();

    if (loading) return <FullScreenLoader/>

    /*const params = useParams();
      const flight_id = params?.flight_id as string;*/

    return (
        <RoleGuard allowedRoles={[RoleEnum.GROUND]}>
            <PageTitleUpdater/>

            {/*Switch between Pages */}
            {user?.workMode === securityClearance
                ? <ClearanceBags user={user}/>
                : <GateBags user={user}/>}
        </RoleGuard>
    )
}
export default BaggageManifest
