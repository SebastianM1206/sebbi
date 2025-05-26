"use client";

import * as React from "react"
import {
    PlusCircle,
    FileText,
    Library,
    MessageSquare,
    Gift,
    Video,
    HelpCircle,
    Keyboard,
    Monitor,
    Sun,
    Moon,
    Zap
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarSeparator,
    SidebarTrigger
} from "@/components/ui/sidebar"
import { useUIStore } from "@/stores/uiStore";

export default function SidebarComponent() {
    const [uploadProgress, setUploadProgress] = React.useState(10);
    const openLibrarySidebar = useUIStore((state) => state.openLibrarySidebar);
    const openDocumentsSidebar = useUIStore((state) => state.openDocumentsSidebar);
    const toggleChatSidebar = useUIStore((state) => state.toggleChatSidebar);

    return (
        <Sidebar className="border-r border-gray-200 bg-white w-[180px] shadow-sm overflow-hidden">
            <SidebarTrigger className="absolute top-2 right-2" />
            <SidebarHeader className="p-2 flex items-center gap-2 border-b border-gray-100">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback className="bg-gray-100 text-gray-800 text-sm">AM</AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-900 text-sm">Alfonso Murillo</span>
            </SidebarHeader>

            <SidebarContent className="py-2">
                <SidebarMenu className="sidebar-menu">
                    <SidebarMenuItem>
                        <SidebarMenuButton className="w-full px-2 py-2 justify-start gap-2 hover:bg-gray-50 text-sm">
                            <PlusCircle className="h-4 w-4 text-indigo-600" />
                            <span className="text-indigo-600 font-medium">New</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            data-tour="documents-button"
                            className="w-full px-2 py-2 justify-start gap-2 hover:bg-gray-50 text-sm documents-button"
                            onClick={openDocumentsSidebar}
                        >
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Documents</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            data-tour="library-button"
                            className="w-full px-2 py-2 justify-start gap-2 hover:bg-gray-50 text-sm library-button"
                            onClick={openLibrarySidebar}
                        >
                            <Library className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Library</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            data-tour="chat-button"
                            className="w-full px-2 py-2 justify-start gap-2 hover:bg-gray-50 text-sm chat-button"
                            onClick={toggleChatSidebar}
                        >
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">AI Chat</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
