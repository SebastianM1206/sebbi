import React from 'react'
import DashboardLayout from './DashboardLayout'
import NotionEditor from './Editor/editor'
function page() {
    return (
        <DashboardLayout>
            <NotionEditor />
        </DashboardLayout>
    )
}

export default page