"use client";

import React from 'react';
import SidebarComponent from './components/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AIChatInterface from './components/AIChatInterface';
export default function DashboardLayout({ children }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <SidebarComponent />
                <SidebarTrigger className="" />
                <main className="flex-1 overflow-auto ">
                    {children}
                </main>
                <AIChatInterface />
            </div>
        </SidebarProvider>
    );
}
