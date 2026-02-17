'use client';

import {useEffect} from 'react'
import {usePathname} from "next/navigation";

const PageTitleUpdater = () => {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname) return;

        const segments = pathname.split("/").filter(Boolean); // remove empty segments
        let lastSegmentIndex = segments.length - 1;
        let lastSegment = segments[lastSegmentIndex];

        // Simple check if last segment is "ID-like" (all letters + numbers, uppercase flight ID)
        const isId = /^[A-Z0-9]+$/.test(lastSegment);

        // If last segment is an ID, use previous segment for title
        if (isId && lastSegment.length > 1) {
            const i = lastSegment.length > 2 ? 3 : 2;
            lastSegment = segments[i];
        }

        // Capitalize first letter
        let appName = "Airport Luggage Handling";
        document.title = lastSegment
            ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) + ` | ${appName}`
            : appName;
    }, [pathname]);

    return null;
}
export default PageTitleUpdater
