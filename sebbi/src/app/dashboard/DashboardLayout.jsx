"use client";

import React from 'react';
import SidebarComponent from './components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AIChatInterface from './components/AIChatInterface';
import LibrarySidebar from './components/LibrarySidebar';
import DocumentsSidebar from './components/DocumentsSidebar';
import TourButton from './components/TourButton';
import { useUIStore } from '@/stores/uiStore';

export default function DashboardLayout({ children }) {
    const { isChatSidebarOpen, isLibrarySidebarOpen, isDocumentsSidebarOpen } = useUIStore();

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <div className="flex">
                    <div data-tour="sidebar">
                        <SidebarComponent />
                    </div>
                    {isDocumentsSidebarOpen && <DocumentsSidebar />}
                    {isLibrarySidebarOpen && (
                        <div data-tour="library">
                            <LibrarySidebar />
                        </div>
                    )}
                </div>
                <main data-tour="editor" className="flex-1 overflow-auto">
                    {children}
                </main>
                <div
                    data-tour="chat"
                    className={`transition-all duration-300 ease-in-out ${isChatSidebarOpen
                        ? 'block w-[200px] sm:w-[250px] md:w-[300px] lg:w-[350px]'
                        : 'hidden w-0'
                        }`}
                >
                    <AIChatInterface />
                </div>
                <TourButton />
            </div>
        </SidebarProvider>
    );
}
