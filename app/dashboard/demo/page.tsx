import React from 'react'
import Link from "next/link";

const Page = () => {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <ul>
                <li><Link href="/dashboard/demo/1">demo 1</Link></li>
                <li><Link href="/dashboard/demo/2">demo 2</Link></li>
                <li><Link href="/dashboard/demo/3">demo 3</Link></li>
                <li><Link href="/dashboard/demo/4">demo 4</Link></li>
                <li><Link href="/dashboard/demo/5">demo 5</Link></li>
            </ul>
        </div>
    )
}
export default Page;
